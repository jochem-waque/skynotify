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
  step: "installation" | "authentication" | "import" | "select" | "set"
  children: ReactNode
}) {
  return (
    <ol className="flex flex-col gap-2 [counter-reset:section]">
      <li
        className={`${step === "installation" ? "snap-start snap-always" : "opacity-50"} flex flex-col gap-2 overflow-hidden after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-200 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Installation</h2>
        </div>
        <div
          className={`${step === "installation" ? "animate-expand" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2 overflow-hidden">
            {step === "installation" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "authentication" ? "snap-start snap-always" : "opacity-50"} flex flex-col gap-2 overflow-hidden after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-200 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Invite code</h2>
        </div>
        <div
          className={`${step === "authentication" ? "animate-expand" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2 overflow-hidden">
            {step === "authentication" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "import" ? "snap-start snap-always" : "opacity-50"} flex flex-col gap-2 overflow-hidden after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-200 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Import following</h2>
        </div>
        <div
          className={`${step === "import" ? "animate-expand" : "grid-rows-[0fr]"} grid duration-500`}
        >
          <div className="flex flex-col gap-2 overflow-hidden">
            {step === "import" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "select" ? "h-[100svh] snap-start snap-always" : "opacity-50"} flex flex-col gap-2 overflow-hidden after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-200 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Select accounts</h2>
        </div>
        <div
          className={`${step === "select" ? "animate-expand" : "grid-rows-[0fr]"} grid overflow-hidden duration-500`}
        >
          <div className="flex flex-col gap-2 overflow-hidden">
            {step === "select" && children}
          </div>
        </div>
      </li>
      <li
        className={`${step === "set" ? "h-[100svh] snap-start snap-always" : "opacity-50"} flex flex-col gap-2 overflow-hidden after:my-1 after:w-full after:border-b`}
      >
        <div className="flex items-center gap-2 before:flex before:aspect-square before:w-8 before:items-center before:justify-center before:rounded-full before:bg-neutral-200 before:content-[counter(section)] before:[counter-increment:section] before:dark:bg-neutral-800">
          <h2 className="text-xl">Set notifications</h2>
        </div>
        <div
          className={`${step === "set" ? "animate-expand" : "grid-rows-[0fr]"} grid overflow-hidden duration-500`}
        >
          <div className="flex flex-col gap-2 overflow-hidden">
            {step === "set" && children}
          </div>
        </div>
      </li>
    </ol>
  )
}
