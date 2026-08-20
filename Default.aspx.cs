using System;
using System.Web.UI;

namespace AiPixel
{
    public partial class Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Catalogs (shutters, motors, controllers) are dummy data in Scripts/data.js.
                // All pricing, Gemini copy, and PDF generation run in the browser for this static demo.
            }
        }
    }
}
