/**
 * Copyright (C) 2024-2025  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import Image from "next/image"

export default function Profile({
  avatar,
  displayName,
  handle,
}: Pick<ProfileView, "avatar" | "displayName" | "handle">) {
  return (
    <div className="flex gap-2 overflow-hidden">
      {avatar && (
        <Image
          className="rounded-full"
          src={avatar}
          width={48}
          height={48}
          alt={"Profile picture"}
          unoptimized={true}
        ></Image>
      )}
      <div className="flex flex-col justify-center overflow-hidden">
        {displayName && <span className="truncate">{displayName}</span>}
        <span className="truncate font-mono even:text-sm even:opacity-75">
          @{handle}
        </span>
      </div>
    </div>
  )
}
