<template>
    <LoadingComponent v-if="isLoading" dataload="des notes" />
    <div v-else>
        <div class="header-title-table">
        <div class="">
            <a v-if="userStore.add" class="btn btn-info btn-lg" data-toggle="modal" data-target="#send_can" @click="getpromotion"> Envoyer </a>
            <button class="btn btn-light btn-lg" @click="exportToExcel">Exporter vers Excel</button>
        </div>
        <SearchInput 
            :rech="texteRecherche"
            :choix_rech="critereRecherche"
            :options="options"
            @update:rech="texteRecherche = $event" 
            @update:choix_rech="critereRecherche = $event"
            @search="filtrerNotes"
        />
        </div>
        
        <TableComponent :columns="noteColumns" :rows="notes">
        <template #actions="{ item }">
            <TableAction :id="item.id" title="les notes" :view_but_del="false" tableEdit="mgj_infoc" @mod_data="dataInitialFormMod">
            <template #form_modifier>
                <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modNote"/>
            </template>
            </TableAction>
        </template>
        </TableComponent>
        <!-- Modal for adding a new note -->
        <ModalComponent id="send_can" title="Envoi des admis">
            <FormComponent :inputs="input_send" label_button="Envoyer" @submit="send_admitted"/>
        </ModalComponent>
    </div>
</template>
<script>
import FormComponent from '@/components/formComponent.vue';
import LoadingComponent from '@/components/loadingComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import TableAction from '@/components/TableAction.vue';
import TableComponent from '@/components/TableComponent.vue';
import { useSubscribeStore } from '@/store/realtime';
import { useUserStore } from '@/store/user';
import { supabase } from '@/supabase';
import { mapStores } from 'pinia';
import { selectPromStore } from '@/store/selectProm';
import * as XLSX from "xlsx";
import SearchInput from '@/components/SearchInput.vue';
import { debounce } from 'lodash';
export default {
    name: 'NotesTemplate',
    components: {
        TableComponent,
        LoadingComponent,
        TableAction,
        FormComponent,
        ModalComponent,
        SearchInput,
    },
    data() {
        return {
            isLoading: true,
            texteRecherche: '',
            critereRecherche: 'nom',
            rech: '',
            data_before_search: [],
            options: [
                { value: 'nom', label: 'Nom' },
                { value: 'filiere', label: 'Filière' },
                { value: 'situ', label: 'Situation' },
            ],
            notes: [],
            noteColumns: [
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px', etat: true},
                { key: 'filiere', label: 'Filière', style: 'min-width: 150px' },
                { key: 'physique', label: 'Physique', style: 'min-width: 100px' },
                { key: 'francais', label: 'Français', style: 'min-width: 100px' },
                { key: 'anglais', label: 'Anglais', style: 'min-width: 100px' },
                { key: 'culg', label: 'Culture général', style: 'min-width: 200px' },
                { key: 'entretien', label: 'Entretien', style: 'min-width: 100px' },
                { key: 'motivation', label: 'Motivation', style: 'min-width: 150px' },
                { key: 'apreciation', label: 'Apréciation', style: 'min-width: 150px' },
                { key: 'com_note', label: 'Commentaire', style: 'min-width: 200px' },
                { key: 'situ', label: 'Situation', style: 'min-width: 150px' },
            ],
            initialValues: {},
            add_initialValue: this.getInitialForm(),
            prom_admis: [],
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        input_send() {
            return [
                    { id: 'prom', type: 'select', label: "Promotion", initialValue: this.initialValues.prom,
                        options: this.prom_admis.map(item => ({
                            value: item.id,
                            text: item.name
                        })),
                        required: true
                    },
                { id: 'rang', type: 'number', label: 'Matricule:',min:this.add_initialValue.matricule ?? 1, initialValue: this.add_initialValue.matricule, required: true },
            ];
        },
        input_mod() {
            return [
                { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
                { id: 'physique', type: 'number', label: 'Physique:',step:0.01, initialValue: this.initialValues.physique ? this.initialValues.physique : 0 },
                { id: 'francais', type: 'number', label: 'Français:',step:0.01, initialValue: this.initialValues.francais ? this.initialValues.francais : 0 },
                { id: 'anglais', type: 'number', label: 'Anglais:',step:0.01, initialValue: this.initialValues.anglais ? this.initialValues.anglais : 0 },
                { id: 'culg', type: 'number', label: 'Culture général:',step:0.01, initialValue: this.initialValues.culg ? this.initialValues.culg : 0 },
                { id: 'entretien', type: 'text', label: 'Entretien:',step:0.01, initialValue: this.initialValues.entretien ? this.initialValues.entretien : ''},
                { id: 'motivation', type: 'number', label: 'Motivation:',step:0.01, initialValue: this.initialValues.motivation ? this.initialValues.motivation : 0 },
                { id: 'apreciation', type: 'text', label: 'Apréciation', initialValue: this.initialValues.apreciation },
                { id: 'com_note', type: 'textarea', label: 'Commentaire', initialValue: this.initialValues.com_note },
                { id: 'situ', type: 'select', label: "Situation:", initialValue: this.initialValues.situ,
                    options: [
                        { value: 'validée', text: 'validée' },
                        { value: 'non validée', text: 'non validée' },
                        { value: 'en attente', text: 'en attente' }
                    ],
                },
            ];
        },
    },
    watch: {
        'selectPromStore.promotionCan_selected': {
            handler() {
            this.debouncedGetNotes();
            },
            immediate: true,
        },
    },
    methods: {
        async getfirstNotes() {  
            this.isLoading = true;
            await this.getNotes();
        },
        async getNotes() {  
            try {
                const { data, error } = await supabase
                    .from('mgj_infoc')
                    .select('*')
                    .eq('prom', this.selectPromStore.promotionCan_selected)
                    .order('id', { ascending: false });
                if (error) throw error;
                
                this.notes = data;
                this.isLoading = false;
                console.log('note :', data);
                
            } catch (error) {
                console.error('Erreur lors de la récupération des notes:', error);
                this.notes = [];
                this.isLoading = false;
            }
        },
        debouncedGetNotes: debounce(function () {
            this.getfirstNotes();
        }, 300),
        async filtrerNotes() {

            if (this.texteRecherche === '') {
                this.getNotes();
                return;
            }
            if (this.critereRecherche === 'nom') {
                try {
                    const { data, error } = await supabase
                        .from('mgj_infoc')
                        .select('*')
                        .eq('prom', this.selectPromStore.promotionCan_selected)
                        .ilike(this.critereRecherche, `%${this.texteRecherche}%`)
                        .order('id', { ascending: false });
                    if (error) throw error;
                    this.notes = data;
                } catch (error) {
                    console.error('Erreur lors de la recherche des notes:', error);
                    this.notes = [];
                }
            }else if(this.critereRecherche === 'situ'){
                    this.texteRecherche = this.texteRecherche.trim(); // Nettoyage direct, trim() supprime les espaces
                    this.texteRecherche = this.texteRecherche.toLowerCase();
                    if(this.texteRecherche === 'valide'|| this.texteRecherche === 'validé'){
                        this.texteRecherche = 'validée';
                    }
                    if(this.texteRecherche === 'non valide' || this.texteRecherche === 'nonvalide' || this.texteRecherche === 'non validé' || this.texteRecherche === 'nonvalidée'){
                        {
                        this.texteRecherche = 'non validée';
                        }
                    }
                    if(this.texteRecherche === 'enattente'){
                        this.texteRecherche = 'en attente';
                    }
                    try {
                        
                        const { data, error } = await supabase
                            .from('mgj_infoc')
                            .select('*')
                            .eq('prom', this.selectPromStore.promotionCan_selected)
                            .eq(this.critereRecherche, `${this.texteRecherche.toLowerCase()}`)
                            .order('id', { ascending: false });
                        
                        if (error) throw error;
                        this.notes = data;
                    } catch (error) {
                        console.error('Erreur lors de la recherche des notes:', error);
                        this.notes = [];
                    }
                    
                } 
                else {
                    try {
                        const { data, error } = await supabase
                            .from('mgj_infoc')
                            .select('*')
                            .eq('prom', this.selectPromStore.promotionCan_selected)
                            .eq(this.critereRecherche, `${this.texteRecherche.toUpperCase()}`)
                            .order('id', { ascending: false });
                        if (error) throw error;
                        this.notes = data;
                    } catch (error) {
                        console.error('Erreur lors de la recherche des notes:', error);
                        this.notes = [];
                    }

                }
        },
        getInitialForm() {
            return {
                prom: '',
                matricule: '',
            };
        },
        async addNote(data) {
            const doubleData = await supabase
                .from('notes')
                .select('*')
                .eq('nom', data.nom)
                .eq('matiere', data.matiere)
                .eq('prom', this.selectPromStore.promotionCan_selected);
            if (doubleData.data.length > 0) {
                alert('Une note pour ce candidat et cette matière existe déjà.');
                return;
            } else {
                try {
                    data.prom = this.selectPromStore.promotionCan_selected;
                    const { error } = await supabase.from('notes').insert([data]);
                    if (error) {
                        throw error;
                    }
                    alert('Note ajoutée avec succès !');
                    this.add_initialValue = this.getInitialForm();
                } catch (error) {
                    console.error('Erreur lors de l\'ajout de la note:', error);
                }
            }
        },
        dataInitialFormMod(item) {
            this.initialValues = item;
        },
        async modNote(data) {
                try {
                    // Nettoyage : convertir les champs vides en null ou nombre
                    Object.keys(data).forEach(key => {
                        if (data[key] === "" || data[key] === undefined) {
                            data[key] = null;
                        }
                    });
                    const { error } = await supabase
                        .from('mgj_infoc')
                        .update(data)
                        .eq('id', this.initialValues.id);
                    if (error) {
                        throw error;
                    }
                    alert('Note modifiée avec succès !');
                } catch (error) {
                    console.error('Erreur lors de la modification de la note:', error);
                    alert('Erreur lors de la modification de la note.');
                }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('mgj_infoc', 'notes', this);
        },
        exportToExcel() {
            const worksheetData = this.notes.map(item => {
                const row = {};
                this.noteColumns.forEach(col => {
                    row[col.label] = item[col.key] || '';
                });
                return row;
            });
            const ws = XLSX.utils.json_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Notes');
            const fileName = 'Notes.xlsx';
            XLSX.writeFile(wb, fileName);
        },
        async getpromotion(){
            const { data, error } = await supabase
                .from('mjg_promotion')
                .select('*')
                .order('id', { ascending: false });
            if (error) {
                console.error('Erreur lors de la récupération de la promotion:', error);
                return;
            }
            this.prom_admis = data;
            this.getMaxMatricule();
        },
        async getMaxMatricule() {
            const { data, error } = await supabase
                .from('mgj_infoc')
                .select('rang')
                .not('rang', 'is', null)
                .order('rang', { ascending: false })
                .limit(1);
                
                // Si aucun enregistrement n'existe encore
                const maxRang = data.length > 0 ? data[0].rang : 0;
                // Ajouter 1 au max ou démarrer à 1
                this.add_initialValue.matricule = maxRang + 1;
            if (error) {
                console.error('Erreur lors de la récupération du matricule:', error);
                return '';
            }
            return;
        },
        async send_admitted(data){
            
        try {
        // 1. Récupérer les candidats "Validé" dans mgj_infoc
        const { data: candidats, error: errorCandidats } = await supabase
            .from('mgj_infoc')
            .select('id,prom_ele')
            .eq('situ', 'validée')
            .eq('prom', this.selectPromStore.promotionCan_selected);
                
        if (errorCandidats) throw errorCandidats;
        // 2. recuperation de la derniere num dans info ou le debut de numerotation saisie par l'utilisateur 
        let num = data.rang || 0;
        let nbr = 0;
        
        for (const sel of candidats) {

            // 3. Vérifier s'il existe déjà dans une autre promotion
            if (sel.prom_ele === null) {
                try {
                    // 4. Insérer le candidat dans la nouvelle promotion
                    const { error: errorInsert } = await supabase
                        .from('mgj_infoc')
                        .update({ prom_ele: data.prom, rang: num })
                        .eq('id', sel.id);
                    if (errorInsert) throw errorInsert;
                    
                    // 5. Mettre à jour le numéro de matricule et le compteur
                    num += 1;
                    nbr++;
                } 
                catch (error) {
                    console.error('Erreur lors de la vérification de la promotion existante:', error);
                }
            }
        }
        if (nbr === 0) {
            alert('Aucun candidat à transférer.');
            return;
        } else {
            const { data: recupname, error} = await supabase
                .from('mjg_promotion')
                .select('*')
                .eq('id', data.prom);
                
            if (error) {
                console.error('Erreur lors de la récupération de la promotion:', error);
                return;
            }
            alert(`${nbr} candidat(s) transféré(s) avec succès dans la promotion ${recupname[0]?.name} !`);
        }
        
            } catch (error) {
                console.error('Erreur lors du transfert :', error);
                alert('Erreur pendant le transfert.');
            }
        }
    },
    async mounted() {
        this.subscribeToTable();
        
        
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('mgj_infoc','notes');
    },
};
</script>