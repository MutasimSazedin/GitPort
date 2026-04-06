import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";
import { seedProjects } from "../data/siteContent";
import { adminEmail, auth, db, hasFirebaseConfig, storage } from "../lib/firebase";

const projectCollectionName = "projects";
const achievementCollectionName = "achievements";
const certificateCollectionName = "certificates";

const mapProject = (documentSnapshot) => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    title: data.title || "Untitled project",
    role: data.role || "Builder",
    year: data.year || "Present",
    category: data.category || "General",
    summary: data.summary || "",
    impact: data.impact || "",
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    link: data.link || "",
    imageUrl: data.imageUrl || "",
    imagePath: data.imagePath || "",
    featured: Boolean(data.featured),
  };
};

const mapAchievement = (documentSnapshot) => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    title: data.title || "Untitled achievement",
    meta: data.meta || "Achievement",
    year: data.year || "",
    summary: data.summary || "",
    link: data.link || "",
  };
};

const mapCertificate = (documentSnapshot) => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    title: data.title || "Untitled certificate",
    issuer: data.issuer || "Issuer",
    year: data.year || "",
    credentialId: data.credentialId || "",
    link: data.link || "",
  };
};

const operationTimeoutMs = 15000;
const readTimeoutMs = 10000;

const withTimeout = async (promise, fallbackMessage) => {
  let timeoutId;

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error(fallbackMessage));
        }, operationTimeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

const mapFirebaseError = (error, fallbackMessage) => {
  if (!error) {
    return new Error(fallbackMessage);
  }

  if (
    error.code === "permission-denied" ||
    error.message?.toLowerCase().includes("permission-denied")
  ) {
    return new Error(
      "Firebase blocked this action. Check your Firestore rules and make sure your admin email is explicitly allowed."
    );
  }

  if (error.code === "failed-precondition") {
    return new Error(
      "Firestore is not fully set up yet. Create the Firestore database in the Firebase console and try again."
    );
  }

  if (
    error.code === "unavailable" ||
    error.code === "deadline-exceeded" ||
    error.message === fallbackMessage
  ) {
    return new Error(fallbackMessage);
  }

  return error instanceof Error ? error : new Error(fallbackMessage);
};

const subscribeWithTimeout = ({
  queryRef,
  onSuccess,
  onTimeout,
  onFailure,
  timeoutMessage,
}) => {
  let resolved = false;

  const timeoutId = window.setTimeout(() => {
    if (resolved) {
      return;
    }

    resolved = true;
    onTimeout(new Error(timeoutMessage));
  }, readTimeoutMs);

  const unsubscribe = onSnapshot(
    queryRef,
    (snapshot) => {
      if (!resolved) {
        resolved = true;
        window.clearTimeout(timeoutId);
      }

      onSuccess(snapshot);
    },
    (error) => {
      if (!resolved) {
        resolved = true;
        window.clearTimeout(timeoutId);
      }

      onFailure(error);
    }
  );

  return () => {
    window.clearTimeout(timeoutId);
    unsubscribe();
  };
};

export const usePortfolioData = () => {
  const [projects, setProjects] = useState(hasFirebaseConfig ? [] : seedProjects);
  const [projectsLoading, setProjectsLoading] = useState(hasFirebaseConfig);
  const [projectError, setProjectError] = useState("");
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(hasFirebaseConfig);
  const [achievementError, setAchievementError] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(hasFirebaseConfig);
  const [certificateError, setCertificateError] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(hasFirebaseConfig);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setAuthLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig || !db) {
      setProjectsLoading(false);
      setAchievementsLoading(false);
      setCertificatesLoading(false);
      return undefined;
    }

    const projectQuery = query(
      collection(db, projectCollectionName),
      orderBy("createdAt", "desc")
    );
    const achievementQuery = query(
      collection(db, achievementCollectionName),
      orderBy("createdAt", "desc")
    );
    const certificateQuery = query(
      collection(db, certificateCollectionName),
      orderBy("createdAt", "desc")
    );

    const unsubscribeProjects = subscribeWithTimeout({
      queryRef: projectQuery,
      onSuccess: (snapshot) => {
        setProjects(snapshot.docs.map(mapProject));
        setProjectError("");
        setProjectsLoading(false);
      },
      onTimeout: (error) => {
        setProjects(seedProjects);
        setProjectError(
          error.message ||
            "The live projects list is taking too long to respond, so the site is showing the local starter projects instead."
        );
        setProjectsLoading(false);
      },
      onFailure: (error) => {
        setProjects(seedProjects);
        setProjectError(
          mapFirebaseError(
            error,
            "The live projects list could not be loaded, so the site is showing the local starter projects instead."
          ).message
        );
        setProjectsLoading(false);
      },
      timeoutMessage:
        "The live projects list is taking too long to respond, so the site is showing the local starter projects instead.",
    });

    const unsubscribeAchievements = subscribeWithTimeout({
      queryRef: achievementQuery,
      onSuccess: (snapshot) => {
        setAchievements(snapshot.docs.map(mapAchievement));
        setAchievementError("");
        setAchievementsLoading(false);
      },
      onTimeout: (error) => {
        setAchievements([]);
        setAchievementError(
          error.message ||
            "The achievements section is taking too long to respond."
        );
        setAchievementsLoading(false);
      },
      onFailure: (error) => {
        setAchievements([]);
        setAchievementError(
          mapFirebaseError(
            error,
            "The achievements section could not be loaded."
          ).message
        );
        setAchievementsLoading(false);
      },
      timeoutMessage: "The achievements section is taking too long to respond.",
    });

    const unsubscribeCertificates = subscribeWithTimeout({
      queryRef: certificateQuery,
      onSuccess: (snapshot) => {
        setCertificates(snapshot.docs.map(mapCertificate));
        setCertificateError("");
        setCertificatesLoading(false);
      },
      onTimeout: (error) => {
        setCertificates([]);
        setCertificateError(
          error.message ||
            "The certificates section is taking too long to respond."
        );
        setCertificatesLoading(false);
      },
      onFailure: (error) => {
        setCertificates([]);
        setCertificateError(
          mapFirebaseError(
            error,
            "The certificates section could not be loaded."
          ).message
        );
        setCertificatesLoading(false);
      },
      timeoutMessage: "The certificates section is taking too long to respond.",
    });

    return () => {
      unsubscribeProjects();
      unsubscribeAchievements();
      unsubscribeCertificates();
    };
  }, []);

  const isAdmin =
    Boolean(user?.email) &&
    Boolean(adminEmail) &&
    user.email.toLowerCase() === adminEmail;

  const signIn = async ({ email, password }) => {
    if (!hasFirebaseConfig || !auth) {
      throw new Error("Firebase is not configured yet.");
    }

    if (!adminEmail) {
      throw new Error("VITE_ADMIN_EMAIL is missing.");
    }

    const credentials = await signInWithEmailAndPassword(auth, email, password);

    if (credentials.user.email?.toLowerCase() !== adminEmail) {
      await signOut(auth);
      throw new Error("This account is not allowed to manage the portfolio.");
    }
  };

  const signOutAdmin = async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
  };

  const requireAdmin = (message) => {
    if (!isAdmin || !db) {
      throw new Error(message);
    }
  };

  const addProject = async (formValues) => {
    requireAdmin("Admin authentication is required to publish.");

    try {
      await withTimeout(
        (async () => {
          const title = formValues.title.trim();
          const role = formValues.role.trim();
          const year = formValues.year.trim();
          const category = formValues.category.trim();
          const summary = formValues.summary.trim();
          const impact = formValues.impact.trim();
          const link = formValues.link.trim();
          const technologies = formValues.tools
            .split(",")
            .map((technology) => technology.trim())
            .filter(Boolean);

          await addDoc(collection(db, projectCollectionName), {
            title,
            role,
            year,
            category,
            summary,
            impact,
            technologies,
            link,
            imageUrl: "",
            imagePath: "",
            featured: Boolean(formValues.featured),
            createdAt: serverTimestamp(),
          });
        })(),
        "The project upload is taking too long. Check Firestore rules, network access, and whether Firebase services are fully set up."
      );
    } catch (error) {
      throw mapFirebaseError(
        error,
        "The project upload is taking too long. Check Firestore rules, network access, and whether Firebase services are fully set up."
      );
    }
  };

  const removeProject = async (project) => {
    requireAdmin("Admin authentication is required to remove projects.");

    try {
      await withTimeout(
        (async () => {
          if (project.imagePath && storage) {
            try {
              await deleteObject(ref(storage, project.imagePath));
            } catch {
              // The record can still be removed if the image asset is already gone.
            }
          }

          await deleteDoc(doc(db, projectCollectionName, project.id));
        })(),
        "Removing the project is taking too long. Check your Firebase connection and rules."
      );
    } catch (error) {
      throw mapFirebaseError(
        error,
        "Removing the project is taking too long. Check your Firebase connection and rules."
      );
    }
  };

  const addAchievement = async (formValues) => {
    requireAdmin("Admin authentication is required to publish achievements.");

    try {
      await withTimeout(
        addDoc(collection(db, achievementCollectionName), {
          title: formValues.title.trim(),
          meta: formValues.meta.trim(),
          year: formValues.year.trim(),
          summary: formValues.summary.trim(),
          link: formValues.link.trim(),
          createdAt: serverTimestamp(),
        }),
        "The achievement upload is taking too long. Check Firestore rules and your network connection."
      );
    } catch (error) {
      throw mapFirebaseError(
        error,
        "The achievement upload is taking too long. Check Firestore rules and your network connection."
      );
    }
  };

  const removeAchievement = async (achievement) => {
    requireAdmin("Admin authentication is required to remove achievements.");

    try {
      await withTimeout(
        deleteDoc(doc(db, achievementCollectionName, achievement.id)),
        "Removing the achievement is taking too long. Check your Firebase connection and rules."
      );
    } catch (error) {
      throw mapFirebaseError(
        error,
        "Removing the achievement is taking too long. Check your Firebase connection and rules."
      );
    }
  };

  const addCertificate = async (formValues) => {
    requireAdmin("Admin authentication is required to publish certificates.");

    try {
      await withTimeout(
        addDoc(collection(db, certificateCollectionName), {
          title: formValues.title.trim(),
          issuer: formValues.issuer.trim(),
          year: formValues.year.trim(),
          credentialId: formValues.credentialId.trim(),
          link: formValues.link.trim(),
          createdAt: serverTimestamp(),
        }),
        "The certificate upload is taking too long. Check Firestore rules and your network connection."
      );
    } catch (error) {
      throw mapFirebaseError(
        error,
        "The certificate upload is taking too long. Check Firestore rules and your network connection."
      );
    }
  };

  const removeCertificate = async (certificate) => {
    requireAdmin("Admin authentication is required to remove certificates.");

    try {
      await withTimeout(
        deleteDoc(doc(db, certificateCollectionName, certificate.id)),
        "Removing the certificate is taking too long. Check your Firebase connection and rules."
      );
    } catch (error) {
      throw mapFirebaseError(
        error,
        "Removing the certificate is taking too long. Check your Firebase connection and rules."
      );
    }
  };

  return {
    projects,
    projectsLoading,
    projectError,
    achievements,
    achievementsLoading,
    achievementError,
    certificates,
    certificatesLoading,
    certificateError,
    isConfigured: hasFirebaseConfig,
    user,
    isAdmin,
    authLoading,
    signIn,
    signOutAdmin,
    addProject,
    removeProject,
    addAchievement,
    removeAchievement,
    addCertificate,
    removeCertificate,
  };
};
