"use client"

import { useDataStore } from "@/util/store"

export default function EmptyText() {
  const loaded = useDataStore((state) => state.loaded)
  const selected = useDataStore((state) => state.selected)

  if (!loaded || selected.size > 0) {
    console.log(loaded, selected.size)
    return null
  }

  return (
    <p>
      You aren&apos;t receiving notifications from any accounts. To easily add
      accounts that you follow on Bluesky, click{" "}
      <span className="font-bold">Import</span> at the bottom. To add accounts
      one-by-one, click the <span className="font-bold">+</span> button.
    </p>
  )
}
