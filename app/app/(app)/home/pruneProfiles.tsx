"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function PruneProfiles() {
  const pruneProfiles = useDataStore((state) => state.pruneProfiles)
  const setUnsaved = useDataStore((state) => state.setUnsaved)

  useEffect(() => {
    pruneProfiles()
    setUnsaved(false)
  })

  return null
}
