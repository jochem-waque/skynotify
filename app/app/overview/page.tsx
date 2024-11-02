/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Footer from "@/components/footer"
import Header from "@/components/header"
import ReturnToSetup from "@/components/returnToSetup"

export default function Page() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col gap-2">
        <ReturnToSetup></ReturnToSetup>
      </main>
      <Footer></Footer>
    </>
  )
}
