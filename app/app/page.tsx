/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import GetStarted from "@/components/getStarted"
import RedirectFromRoot from "@/components/redirectFromRoot"

export default async function Page() {
  return (
    <>
      <main className="flex grow flex-col items-center justify-center">
        <RedirectFromRoot></RedirectFromRoot>
        <div className="text-center">
          <h1 className="text-4xl">Bluesky Post Notifications</h1>
          <span>by {process.env.AUTHOR}</span>
        </div>
        <div className="max-h-16 grow"></div>
        <GetStarted></GetStarted>
      </main>
      <Footer absolute={true}></Footer>
    </>
  )
}
