/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { ReactNode } from "react"

export default function InstructionList({
  step,
  children,
}: {
  step: "installation" | "import" | "select" | "set"
  children: ReactNode
}) {
  return (
    <ol className="flex flex-col gap-2 [counter-reset:section]">
      <li
        className={`${step === "installation" ? "" : "opacity-50"} flex flex-col gap-2 after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-100 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Installation</h2>
        </div>
        <div
          className={`${step === "installation" ? "" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2">
            {step === "installation" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "import" ? "" : "opacity-50"} flex flex-col gap-2 after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-100 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Import following</h2>
        </div>
        <div
          className={`${step === "import" ? "" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2">
            {step === "import" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "select" ? "" : "opacity-50"} flex flex-col gap-2 after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-100 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Select accounts</h2>
        </div>
        <div
          className={`${step === "select" ? "" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2">
            {step === "select" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "set" ? "" : "opacity-50"} flex flex-col gap-2 after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-100 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Set notifications</h2>
        </div>
        <div
          className={`${step === "set" ? "" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2">
            {step === "set" && children}
          </div>
        </div>
      </li>
    </ol>
  )
}
