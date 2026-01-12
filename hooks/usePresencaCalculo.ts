import { PresencaRecord } from "@/types/usuarios";

interface PresencaCalculoParams {
    presencaRecords: PresencaRecord[];
    currentYear: number;
}

interface PresencaCalculoResult {
    totalPresencas: number;
    presencasConfirmadas: number;
    porcentagemPresenca: number;
    presencasDoSemestre: PresencaRecord[];
    getSemestreInfo: () => { nome: string; periodo: string };
}

export const usePresencaCalculo = ({
    presencaRecords,
    currentYear
}: PresencaCalculoParams): PresencaCalculoResult => {
    const hoje = new Date();

    // Filtrar presenças do semestre atual
    const presencasDoSemestre = presencaRecords.filter(record => {
        const data = new Date(record.date + 'T00:00:00');
        const anoCorreto = data.getFullYear() === currentYear;

        const mes = data.getMonth();
        const noPrimeiroSemestre = mes >= 0 && mes <= 5;
        const noSegundoSemestre = mes >= 6 && mes <= 11;

        return anoCorreto && (
            (hoje.getMonth() <= 5 && noPrimeiroSemestre) ||
            (hoje.getMonth() > 5 && noSegundoSemestre)
        );
    });

    // Estatísticas de presença
    const totalPresencas = presencasDoSemestre.length;
    const presencasConfirmadas = presencasDoSemestre.filter(r => r.confirmada).length;

    // Calcular porcentagem por semestre
    const getPorcentagemPresenca = (): number => {
        const currentMonth = hoje.getMonth();

        let inicioSemestre: Date;
        let fimSemestre: Date;
        let diasUteisTotalSemestre: number;

        if (currentMonth >= 0 && currentMonth <= 5) {
            // Primeiro semestre: 5 de janeiro a 30 de junho
            inicioSemestre = new Date(currentYear, 0, 5);
            fimSemestre = new Date(currentYear, 5, 30);
            diasUteisTotalSemestre = 152; // FIXO para 2026
        } else {
            // Segundo semestre: 1 de julho a 31 de dezembro
            inicioSemestre = new Date(currentYear, 6, 1);
            fimSemestre = new Date(currentYear, 11, 31);
            diasUteisTotalSemestre = calcularDiasUteis(inicioSemestre, fimSemestre);
        }

        const presencasValidas = presencasDoSemestre.filter(r => r.confirmada).length;

        if (diasUteisTotalSemestre === 0) return 0;

        const porcentagem = Math.round(
            Number(((presencasValidas / diasUteisTotalSemestre) * 100).toFixed(2))
        );

        if (hoje < inicioSemestre) {
            return 0;
        }

        return porcentagem > 100 ? 100 : porcentagem;
    };

    // Cálculo de dias úteis
    const calcularDiasUteis = (inicio: Date, fim: Date): number => {
        let count = 0;
        const current = new Date(inicio);
        const fimDate = new Date(fim);

        current.setHours(0, 0, 0, 0);
        fimDate.setHours(0, 0, 0, 0);

        while (current <= fimDate) {
            const day = current.getDay();
            if (day >= 1 && day <= 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    };

    // Informações do semestre
    const getSemestreInfo = () => {
        const currentMonth = hoje.getMonth();

        if (currentMonth >= 0 && currentMonth <= 5) {
            return {
                nome: "1º Semestre",
                periodo: "Jan-Jun"
            };
        } else {
            return {
                nome: "2º Semestre",
                periodo: "Jul-Dez"
            };
        }
    };

    return {
        totalPresencas,
        presencasConfirmadas,
        porcentagemPresenca: getPorcentagemPresenca(),
        presencasDoSemestre,
        getSemestreInfo
    };
};