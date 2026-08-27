using Domain.Enums;
using Domain.Exceptions;

namespace Domain.Entities
{
    public class Carona
    {
        /// <summary>
        /// A data e a hora chegam como a pessoa as escolheu, no fuso do produto.
        /// Compará-las direto com <see cref="DateTime.UtcNow"/> recusava carona
        /// marcada para as próximas horas, dizendo que a data era passada.
        /// </summary>
        private static readonly TimeZoneInfo FusoDoProduto =
            TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

        public Guid Id { get; private set; }
        public int QtdVagas { get; private set; }
        public string Destino { get; private set; } = default!;
        public DateOnly DataPartida { get; private set; }
        public TimeOnly HoraPartida { get; private set; }
        public DateTime DataCadastro { get; private set; }
        public EnumTipoCarona TipoCarona { get; private set; }
        public string? Descricao { get; private set; }
        public bool Ativo { get; private set; }

        private Carona() { }

        public Carona(int qtdVagas, string destino, DateOnly dataPartida,
            TimeOnly horaPartida, EnumTipoCarona tipoCarona, string? descricao = null)
        {
            ValidarDataPartida(dataPartida, horaPartida);
            ValidarQtdVagas(qtdVagas);

            Id = Guid.NewGuid();
            QtdVagas = qtdVagas;
            Destino = destino;
            DataPartida = dataPartida;
            HoraPartida = horaPartida;
            DataCadastro = DateTime.UtcNow;
            TipoCarona = tipoCarona;
            Descricao = descricao;
            Ativo = true;
        }

        public void AtualizarAtributosBasicos(int? qtdVagas, string? destino, EnumTipoCarona? tipoCarona, string? descricao)
        {
            if (qtdVagas.HasValue)
            {
                ValidarQtdVagas(qtdVagas.Value);
                QtdVagas = qtdVagas.Value;
            }

            if (!string.IsNullOrWhiteSpace(destino))
                Destino = destino;

            if (tipoCarona.HasValue)
                TipoCarona = tipoCarona.Value;

            // Ausente mantém o texto atual; string vazia é como a edição o apaga.
            if (descricao is not null)
                Descricao = descricao;
        }

        public void AlterarDataPartida(DateOnly? dataPartida, TimeOnly? horaPartida)
        {
            var novaData = dataPartida ?? this.DataPartida;
            var novaHora = horaPartida ?? this.HoraPartida;

            ValidarDataPartida(novaData, novaHora);

            DataPartida = novaData;
            HoraPartida = novaHora;
        }

        public void Desativar()
        {
            if (!Ativo)
                throw new DomainException("Esta carona já está desativada.");

            Ativo = false;
        }

        private void ValidarDataPartida(DateOnly data, TimeOnly hora)
        {
            DateTime partidaUtc = TimeZoneInfo.ConvertTimeToUtc(data.ToDateTime(hora), FusoDoProduto);

            if (partidaUtc < DateTime.UtcNow)
                throw new DomainException("A data da carona tem que ser uma data futura");
        }

        private void ValidarQtdVagas(int qtdVagas)
        {
            if (qtdVagas < 1 || qtdVagas > 7)
                throw new DomainException("A quantidade de vagas deve ser entre 1 e 7.");
        }
    }
}