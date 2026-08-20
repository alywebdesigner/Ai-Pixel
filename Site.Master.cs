using System;
using System.Web.UI;

namespace AiPixel
{
    public partial class SiteMaster : MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Chrome (header, step rail, running total) is rendered by the master page.
            // Wizard state is owned by the client-side SPA in Scripts/app.js for this static demo.
        }
    }
}
