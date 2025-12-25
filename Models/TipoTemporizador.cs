using System.Text.Json.Serialization;

namespace Timer.Models
{
	public class TipoTemporizador
	{
		public int id { get; set; }
		public string nombre { get; set; }
		public Tiempo recomendado { get; set; }


	}
}
