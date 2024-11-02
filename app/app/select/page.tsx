/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import Header from "@/components/header"
import InstructionList from "@/components/instructionList"
import SearchableProfileSelectorList from "@/components/profile/searchableProfileSelectorList"
import Link from "next/link"

export default function Page() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col gap-4">
        <InstructionList step="select">
          <div className="flex flex-col gap-2">
            <p>
              Now, select up to {process.env.NEXT_PUBLIC_SUBSCRIPTION_LIMIT}{" "}
              profiles you&apos;d like to receive notifications for. You&apos;ll
              be able to specify the kinds of notifications you&apos;d like to
              receive from each profile later.
            </p>
          </div>
          {/* <label className="flex items-center self-start rounded-full bg-neutral-200 px-3 py-1 outline-2 outline-black transition hover:opacity-75 has-[:checked]:bg-blue-400 has-[:focus-visible]:outline dark:bg-neutral-800 dark:outline-white has-[:checked]:dark:bg-blue-600">
            <SelectAllChipInput></SelectAllChipInput>
            <span className="select-none peer-checked:hidden">Select all</span>
            <span className="hidden select-none peer-checked:inline">
              Deselect all
            </span>
          </label> */}
          <SearchableProfileSelectorList></SearchableProfileSelectorList>
          <div className="mt-auto flex w-full">
            <Link
              href="specify"
              className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center dark:bg-blue-600"
            >
              Continue
            </Link>
          </div>
        </InstructionList>
      </main>
      <Footer></Footer>
    </>
  )
}
