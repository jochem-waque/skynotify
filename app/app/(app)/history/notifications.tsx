/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { NotificationPayload } from "@/util/notification"
import { get } from "idb-keyval"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import RelativeDateTime from "./relativeDateTime"

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>()

  useEffect(() => {
    async function load() {
      setNotifications(await get<NotificationPayload[]>("history"))
    }

    load()
  }, [])

  if (!notifications?.length) {
    return (
      <p>
        This page will display previously received notifications. Older
        notifications received before this page was added won&apos;t be shown.
      </p>
    )
  }

  return notifications?.map((data) => (
    <Link
      key={data.tag}
      href={data.url ?? "https://bsky.app/"}
      className="w-full rounded-lg bg-neutral-100 p-4 transition-opacity hover:opacity-75 dark:bg-neutral-800"
    >
      <div className="flex items-start gap-2">
        {data.icon && (
          <Image
            src={data.icon}
            alt="Icon"
            width={48}
            height={48}
            className="rounded-full"
          ></Image>
        )}
        <div className="flex grow flex-col gap-2 overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="overflow-hidden font-bold text-ellipsis whitespace-nowrap">
                {data.title}
              </span>
              {data.timestamp && (
                <span className="text-xs whitespace-nowrap opacity-50">
                  <RelativeDateTime
                    timestamp={parseInt(data.timestamp)}
                  ></RelativeDateTime>
                </span>
              )}
            </div>
            {data.body && <p className="break-words">{data.body}</p>}
          </div>
          {data.image && (
            <Image
              className="h-auto w-full rounded-lg"
              src={data.image}
              alt="Image"
              width={400}
              height={400}
            ></Image>
          )}
        </div>
      </div>
    </Link>
  ))
}
