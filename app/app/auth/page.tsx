/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import AuthForm from "@/components/authForm"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ installed?: string }>
}) {
  const { installed } = await searchParams

  return <AuthForm installed={installed === "true"}></AuthForm>
}
