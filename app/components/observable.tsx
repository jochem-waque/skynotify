/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { CSSProperties, useEffect, useRef } from "react"

export default function Observable({
  style,
  observer,
  index,
}: {
  style?: CSSProperties
  observer?: IntersectionObserver
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!observer || !ref.current) {
      return
    }

    const currentElement = ref.current
    observer.observe(currentElement)
    // TODO this shouldn't be necessary but here we are
    const timeout = setTimeout(
      () => currentElement.setAttribute("data-valid", "true"),
      100,
    )

    return () => {
      observer.unobserve(currentElement)
      currentElement.removeAttribute("data-valid")
      clearTimeout(timeout)
    }
  }, [observer])

  return (
    <div data-index={index} ref={ref} className="absolute" style={style}></div>
  )
}
