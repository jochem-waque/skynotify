/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export type Profile = Pick<
  ProfileView,
  "handle" | "displayName" | "description" | "avatar"
>

export function pickProfile({
  handle,
  displayName,
  description,
  avatar,
}: Profile): Profile {
  return {
    handle,
    displayName,
    description,
    avatar: avatar?.replace("/avatar/", "/avatar_thumbnail/"),
  }
}
