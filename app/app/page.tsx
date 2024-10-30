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
    <main className="my-auto flex grow flex-col justify-center">
        <RedirectFromRoot></RedirectFromRoot>
        <div className="text-center">
          <h1 className="text-4xl">Bluesky Post Notifications</h1>
        <span>by jochem.cc</span>
        </div>
        <div className="max-h-16 grow"></div>
        <GetStarted></GetStarted>
      </main>
      <Footer absolute={true}></Footer>
    </>
  )
}
