/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useEffect, useRef, useState } from "react"

const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour

const exactFormat = new Intl.DateTimeFormat("en")
const relativeFormat = new Intl.RelativeTimeFormat("en")

function generateText(timestamp: number): {
  text: string
  granularity: "exact" | "hour" | "minute" | "second"
} {
  const diff = timestamp - Date.now()
  const absDiff = Math.abs(diff)

  if (absDiff > day) {
    return {
      text: exactFormat.format(timestamp),
      granularity: "exact",
    }
  }

  if (absDiff > hour) {
    return {
      text: relativeFormat.format(Math.ceil(diff / hour), "hour"),
      granularity: "hour",
    }
  }

  if (absDiff > minute) {
    return {
      text: relativeFormat.format(Math.ceil(diff / minute), "minute"),
      granularity: "minute",
    }
  }

  return {
    text: relativeFormat.format(Math.ceil(diff / second), "second"),
    granularity: "second",
  }
}

function calculateTimeout(
  timestamp: number,
  granularity: "hour" | "minute" | "second",
) {
  const diff = Math.abs(timestamp - Date.now())

  switch (granularity) {
    case "hour":
      return hour - (diff % hour)
    case "minute":
      return minute - (diff % minute)
    case "second":
      return second - (diff % second)
  }
}

export default function RelativeDateTime({ timestamp }: { timestamp: number }) {
  const [state, setState] = useState(generateText(timestamp))
  const timeout = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    clearTimeout(timeout.current)
    if (state.granularity === "exact") {
      return
    }

    timeout.current = setTimeout(
      () => setState(generateText(timestamp)),
      calculateTimeout(timestamp, state.granularity),
    )
  }, [state, timestamp])

  return state.text
}
