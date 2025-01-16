/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Profile from "@/components/profile"
import { Profile as ProfileData } from "@/util/profile"
import { useDataStore } from "@/util/store"
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { FormEvent, MouseEvent, useRef, useState } from "react"

export default function Dialog() {
  const addProfile = useDataStore((state) => state.addProfile)
  const setUnsaved = useDataStore((state) => state.setUnsaved)
  const [visible, setVisible] = useState(false)
  const [profile, setProfile] = useState<ProfileData & { did: string }>()
  const [suggestions, setSuggestions] = useState<ProfileViewBasic[]>()
  const atpAgent = useDataStore((state) => state.atpAgent)
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const form = useRef<HTMLFormElement>(null)

  function toggleVisibility(event: MouseEvent) {
    if (event.target !== event.currentTarget) {
      return
    }

    if (suggestions !== undefined) {
      setSuggestions(undefined)
      return
    }

    setVisible((old) => !old)
    setProfile(undefined)
  }

  function input(event: FormEvent<HTMLInputElement>) {
    clearTimeout(timeout.current)
    const value = event.currentTarget.value
    timeout.current = setTimeout(() => populateSuggestions(value), 200)
  }

  async function populateSuggestions(q: string) {
    if (!q) {
      setSuggestions(undefined)
      return
    }

    const response = await atpAgent.searchActorsTypeahead({ q, limit: 5 })
    if (!response.success) {
      console.error(response)
      return
    }

    setSuggestions(response.data.actors)
  }

  function add() {
    if (!profile) {
      return
    }

    const data = new FormData(form.current ?? undefined)

    addProfile(profile, {
      posts: data.has("posts"),
      reposts: data.has("reposts"),
      replies: data.has("replies"),
    })
    setSuggestions(undefined)
    setUnsaved()
    setVisible((old) => !old)
    setProfile(undefined)
  }

  return (
    <>
      <button
        onClick={toggleVisibility}
        className="bg-primary fixed right-2 bottom-20 z-30 aspect-square w-14 cursor-pointer rounded-full text-4xl transition-opacity hover:opacity-75"
        type="button"
      >
        +
      </button>
      {visible && (
        <div
          onMouseDown={toggleVisibility}
          className="fixed top-0 left-0 z-40 flex h-[100svh] w-[100vw] items-center justify-center bg-black/50 p-2"
        >
          <div className="flex w-full max-w-xl flex-col gap-2 rounded-lg bg-neutral-200 p-2 dark:bg-neutral-800">
            <div className="relative flex flex-col gap-2">
              <input
                className="rounded-lg p-2 font-mono dark:bg-neutral-700"
                type="text"
                placeholder="handle.bsky.social"
                onInput={input}
                spellCheck={false}
                autoFocus={true}
              ></input>
              {suggestions && (
                <div className="absolute top-full -left-2 z-10 flex w-[calc(100%+1rem)] flex-col gap-1 rounded-lg bg-neutral-800 p-2 font-mono">
                  {suggestions.map((profile) => (
                    <button
                      onClick={() => {
                        setProfile(profile)
                        setSuggestions(undefined)
                      }}
                      type="button"
                      key={profile.did}
                      className="cursor-pointer rounded-lg bg-neutral-700 p-2 text-left transition-opacity hover:opacity-75"
                    >
                      {profile.handle}
                    </button>
                  ))}
                  {suggestions.length === 0 && (
                    <button className="rounded-lg bg-neutral-700 p-2 text-left">
                      No profiles found
                    </button>
                  )}
                </div>
              )}
            </div>
            {profile && (
              <div className="flex flex-col gap-2 transition-opacity group-aria-disabled:pointer-events-none group-aria-disabled:opacity-50">
                <Profile
                  avatar={profile.avatar}
                  handle={profile.handle}
                  displayName={profile.displayName}
                ></Profile>
                <form ref={form} className="flex flex-wrap gap-2">
                  <label className="has-checked:bg-primary flex cursor-pointer items-center rounded-full bg-neutral-300 px-3 py-1 transition hover:opacity-75 has-focus-visible:outline-2 dark:bg-neutral-700">
                    <span className="select-none">Posts</span>
                    <input
                      name="posts"
                      className="h-0 w-0"
                      type="checkbox"
                    ></input>
                  </label>
                  <label className="has-checked:bg-primary flex cursor-pointer items-center rounded-full bg-neutral-300 px-3 py-1 transition hover:opacity-75 has-focus-visible:outline-2 dark:bg-neutral-700">
                    <span className="select-none">Reposts</span>
                    <input
                      name="reposts"
                      className="h-0 w-0"
                      type="checkbox"
                    ></input>
                  </label>
                  <label className="has-checked:bg-primary flex cursor-pointer items-center rounded-full bg-neutral-300 px-3 py-1 transition hover:opacity-75 has-focus-visible:outline-2 dark:bg-neutral-700">
                    <span className="select-none">Replies</span>
                    <input
                      name="replies"
                      className="h-0 w-0"
                      type="checkbox"
                    ></input>
                  </label>
                </form>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={toggleVisibility}
                className="bg-primary grow basis-0 cursor-pointer rounded-lg p-2 transition-opacity hover:opacity-75"
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={!profile}
                className="bg-primary grow basis-0 cursor-pointer rounded-lg p-2 transition-opacity hover:opacity-75 disabled:opacity-75"
                type="button"
                onClick={add}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
