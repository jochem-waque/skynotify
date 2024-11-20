/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export async function POST(request: Request) {
  try {
    console.log(await request.json())
  } catch (e) {
    console.error(e)
    return new Response(null, { status: 400 })
  }

  return new Response(null, { status: 200 })
}
