/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const params: { did: string; pid: string } = useParams();

  const url = new URL(
    `https://bsky.app/profile/${decodeURIComponent(
      params.did
    )}/post/${decodeURIComponent(params.pid)}`
  );

  useEffect(() => {
    window.location.href = navigator.userAgent.toLowerCase().includes("android")
      ? `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;end`
      : url.toString();
  });

  return <span>Opening in Bluesky...</span>;
}
