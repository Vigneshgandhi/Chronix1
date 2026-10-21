"use client";

import { useEffect, useState } from "react";

import {
  initializeChronixStorage,
} from "@/app/utils/Storagemanager";

export default function StorageStatus() {
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    async function initialize() {
      const result =
        await initializeChronixStorage();

      setStorage(result);
    }

    initialize();
  }, []);

  if (!storage) {
    return (
      <p>
        Checking Chronix storage...
      </p>
    );
  }

  return (
    <div>
      <h2>Chronix Local Storage</h2>

      <p>
        Used: {storage.usageGB} GB
      </p>

      <p>
        Available: {storage.availableGB} GB
      </p>

      <p>
        Browser quota: {storage.quotaGB} GB
      </p>

      <p>
        Usage: {storage.usedPercentage}%
      </p>

      <p>
        Persistent:
        {storage.persistent ? " Yes" : " No"}
      </p>
    </div>
  );
}