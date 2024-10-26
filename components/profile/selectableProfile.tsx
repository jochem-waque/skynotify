/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Profile from "./profile"
import SelectableProfileInput from "./selectableProfileInput"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export default function SelectableProfile({
  avatar,
  displayName,
  handle,
  did,
}: Pick<ProfileView, "avatar" | "displayName" | "handle" | "did">) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-neutral-100 p-2 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:opacity-75 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
      <Profile
        avatar={avatar}
        displayName={displayName}
        handle={handle}
      ></Profile>
      <SelectableProfileInput did={did}></SelectableProfileInput>
    </label>
  )
}
