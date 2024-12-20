"use client"

import { useDataStore } from "@/util/store"
import { useEffect } from "react"

export default function UpdateNotifyAll() {
  const updateNotifyAll = useDataStore((state) => state.updateNotifyAll)
  const selected = useDataStore((state) => state.selected)

  useEffect(() => {
    updateNotifyAll()
  }, [updateNotifyAll, selected])

  return null
}
