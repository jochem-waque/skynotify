"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function PruneProfiles() {
  const pruneProfiles = useDataStore((state) => state.pruneProfiles)

  useEffect(() => pruneProfiles())

  return null
}
