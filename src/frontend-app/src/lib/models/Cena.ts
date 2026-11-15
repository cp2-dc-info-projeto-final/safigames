export interface Cena{
    id: number,
    npc: string,
    dialogo: string,
    tipo: string,
    id_inimigo: number,
    id_comerciante: number,
    id_episodio: number
}

export interface CenaFormData{
    id: number,
    npc: string,
    dialogo: string,
    tipo: string,
    id_inimigo?: number,
    id_comerciante?: number,
    id_episodio: number
}