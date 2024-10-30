/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { auth } from "@/actions/auth"
import { useActionState } from "react"

export default function AuthForm() {
  const [error, authAction] = useActionState(auth, "none")

  return (
    <form action={authAction} className="flex flex-col justify-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <label className="w-full" htmlFor="password">
          Next, enter your invite code. This service is currently in a closed
          beta, which is why an invite code is required.
        </label>
        <input
          autoComplete="password"
          maxLength={36}
          required={true}
          className="w-full rounded-lg p-2 font-mono"
          id="password"
          name="password"
          type="password"
          placeholder="Invite code"
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}"
        ></input>
      </div>
      {error !== "none" && (
        <p className="text-center text-red-500">Invalid invite code.</p>
      )}
      <button
        className="w-full rounded-lg bg-blue-400 p-4 dark:bg-blue-600"
        type="submit"
      >
        Continue
      </button>
    </form>
  )
}
