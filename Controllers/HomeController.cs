using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;
using Timer.Models;
using Timer.Models.DTO;

namespace Timer.Controllers
{
    public class HomeController : Controller
    {
		private readonly IWebHostEnvironment _env;
		public HomeController(IWebHostEnvironment env) {
			_env = env;
		}
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

		[HttpGet]
		public IActionResult TipoTimerInicial()
		{
            List<TipoTemporizador> tiposIniciales = null;
            try
            {
                var path = Path.Combine(_env.ContentRootPath, "Models", "TiposTemporizadorIniciales.json");
                var json = System.IO.File.ReadAllText(path);
                tiposIniciales = JsonSerializer.Deserialize<List<TipoTemporizador>>(json);
            }
            catch (Exception ex)
            {
                return BadRequest(new {error = ex.Message});
            }
            return Ok(tiposIniciales);
		}

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
