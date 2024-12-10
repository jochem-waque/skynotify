"use client"

import Profile from "@/components/profile"
import { Profile as ProfileData, useDataStore } from "@/util/store"
import NotificationChipInput from "../import/specify/notificationChipInput"

export default function EditableProfile({
  did,
  profile,
}: {
  did: string
  profile: ProfileData
}) {
  const setSelected = useDataStore((state) => state.setSelected)
  const selected = useDataStore((state) => state.selected)

  function click() {
    setSelected(did)
  }

  return (
    <div
      aria-disabled={!selected.has(did)}
      className="group flex items-center justify-between rounded-lg bg-neutral-100 p-2 transition-colors aria-disabled:bg-opacity-50 dark:bg-neutral-800"
    >
      <div className="flex flex-col gap-2 transition-opacity group-aria-disabled:pointer-events-none group-aria-disabled:opacity-50">
        <Profile
          avatar={profile.avatar}
          handle={profile.handle}
          displayName={profile.displayName}
        ></Profile>
        <form className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <span className="select-none">Posts</span>
            <NotificationChipInput
              did={did}
              type={"posts"}
            ></NotificationChipInput>
          </label>
          <label className="flex cursor-pointer items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <span className="select-none">Reposts</span>
            <NotificationChipInput
              did={did}
              type={"reposts"}
            ></NotificationChipInput>
          </label>
          <label className="flex cursor-pointer items-center rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-700 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <span className="select-none">Replies</span>
            <NotificationChipInput
              did={did}
              type={"replies"}
            ></NotificationChipInput>
          </label>
        </form>
      </div>
      <button
        className="aspect-square min-w-8 rounded-full bg-neutral-200 transition hover:opacity-75 group-aria-disabled:rotate-45 dark:bg-neutral-700"
        type="button"
        onClick={click}
      >
        ✕
      </button>
    </div>
  )
}
