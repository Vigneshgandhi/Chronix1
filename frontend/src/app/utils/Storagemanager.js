const GB = 1024 ** 3;
const MB = 1024 ** 2;

export async function getStorageInfo() {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage?.estimate
  ) {
    throw new Error("Storage estimation is not supported.");
  }

  const estimate = await navigator.storage.estimate();

  const usage = estimate.usage ?? 0;
  const quota = estimate.quota ?? 0;
  const available = Math.max(0, quota - usage);

  return {
    usage,
    quota,
    available,

    usageMB: Number((usage / MB).toFixed(2)),
    usageGB: Number((usage / GB).toFixed(2)),

    quotaGB: Number((quota / GB).toFixed(2)),

    availableGB: Number(
      (available / GB).toFixed(2)
    ),

    usedPercentage:
      quota > 0
        ? Number(((usage / quota) * 100).toFixed(2))
        : 0,
  };
}

export async function requestPersistentStorage() {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage
  ) {
    return {
      supported: false,
      persistent: false,
    };
  }

  if (
    !navigator.storage.persist ||
    !navigator.storage.persisted
  ) {
    return {
      supported: false,
      persistent: false,
    };
  }

  const alreadyPersistent =
    await navigator.storage.persisted();

  if (alreadyPersistent) {
    return {
      supported: true,
      persistent: true,
    };
  }

  const granted =
    await navigator.storage.persist();

  return {
    supported: true,
    persistent: granted,
  };
}

export async function initializeChronixStorage() {
  try {
    const persistence =
      await requestPersistentStorage();
    const estimatestorage=await navigator.storage.estimate();
    const storage =
      await getStorageInfo();

    console.log("====== CHRONIX STORAGE ======");

    console.log(
      "Persistent:",
      persistence.persistent
    );

    console.log(
      "Used:",
      storage.usageGB,
      "GB"
    );

    console.log(
      "Quota:",
      storage.quotaGB,
      "GB"
    );

    console.log(
      "Available:",
      storage.availableGB,
      "GB"
    );

    console.log(
      "Usage:",
      storage.usedPercentage,
      "%"
    );

    console.log("=============================");

    return {
      ...storage,
      persistent: persistence.persistent,
    };

  } catch (error) {
    console.error(
      "Chronix storage initialization failed:",
      error
    );

    return null;
  }
}


/**
 * Check whether there is enough estimated storage
 * before receiving/storing a file.
 */
export async function canStoreFile(fileSize) {
  const storage = await getStorageInfo();

  // Keep 500 MB as safety space.
  const reserve = 500 * MB;

  return (
    storage.available >
    fileSize + reserve
  );
}