/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { auth } from "@/actions/auth"
import { useActionState } from "react"

export default function AuthForm({ installed }: { installed: boolean }) {
  const [, authAction] = useActionState(auth, "none")

  return (
    <form
      action={authAction}
      className="container flex h-full max-w-lg flex-col items-center justify-center gap-48"
    >
      <div className="flex w-full flex-col items-center gap-2">
        <label className="w-full max-w-[36ch]" htmlFor="password">
          Account ID
        </label>
        <input
          autoComplete="password"
          maxLength={36}
          required={true}
          className="box-content w-full max-w-[36ch] rounded-lg p-2 font-mono"
          id="password"
          name="password"
          type="password"
          placeholder="________-____-____-____-____________"
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}"
        ></input>
        {installed && (
          <input type="hidden" name="installed" value="true"></input>
        )}
      </div>
      <button
        className="w-full rounded-lg bg-blue-400 p-4 dark:bg-blue-600"
        type="submit"
      >
        Authenticate
      </button>
    </form>
  )
}
