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
            <TableAction :id="item.id" title="les notes" :view_but_del="false" tableEdit="infoc" @mod_data="dataInitialFormMod">
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
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' },
                { key: 'filiere', label: 'Filière', style: 'min-width: 150px' },
                { key: 'ecrit', label: 'Ecrit', style: 'min-width: 100px' },
                { key: 'motivation', label: 'Motivation', style: 'min-width: 150px' },
                { key: 'apreciation', label: 'Apréciation', style: 'min-width: 150px' },
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
                { id: 'id', type: 'number', label: 'Matricule:', initialValue: this.add_initialValue.matricule, required: true },
            ];
        },
        input_mod() {
            return [
                { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
                { id: 'ecrit', type: 'number', label: 'Ecrit:', initialValue: this.initialValues.ecrit},
                { id: 'motivation', type: 'number', label: 'Motivation:', initialValue: this.initialValues.motivation },
                { id: 'apreciation', type: 'number', label: 'Note', initialValue: this.initialValues.apreciation },
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
                this.getNotes();
            },
            immediate: true,
        },
    },
    methods: {
        async getNotes() {
            this.isLoading = true;
            try {
                const { data, error } = await supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom', this.selectPromStore.promotionCan_selected)
                    .order('id', { ascending: false });
                if (error) throw error;
                
                this.notes = data;
                this.data_before_search = data;
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des notes:', error);
                this.notes = [];
                this.isLoading = false;
            }
        },
        async filtrerNotes() {
            this.texteRecherche = this.texteRecherche.trim(); // Nettoyage direct, trim() supprime les espaces

            if (this.texteRecherche === '') {
                this.notes = this.data_before_search;
                return;
            }
            if (this.critereRecherche === 'nom') {
                try {
                    const { data, error } = await supabase
                        .from('infoc')
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
                            .from('infoc')
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
                            .from('infoc')
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
                    const { error } = await supabase
                        .from('infoc')
                        .update(data)
                        .eq('id', this.initialValues.id);
                    alert('Note modifiée avec succès !');
                    if (error) {
                        throw error;
                    }
                } catch (error) {
                    console.error('Erreur lors de la modification de la note:', error);
                }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('infoc', 'notes', this);
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
                .from('promotion')
                .select('*')
            if (error) {
                console.error('Erreur lors de la récupération de la promotion:', error);
                return;
            }
            this.prom_admis = data;
            this.getMaxMatricule();
        },
        async getMaxMatricule() {
            const { data, error } = await supabase
                .from('info')
                .select('rang')
                .order('rang', { ascending: false })
                .limit(1);
                this.add_initialValue.matricule = data[0].rang+1;
                console.log('Matricule récupéré:', this.initialValues.matricule);

                
            if (error) {
                console.error('Erreur lors de la récupération du matricule:', error);
                return '';
            }
            return;
        },

    },
    async mounted() {
        await this.getNotes();
        this.subscribeToTable();
        
        
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('infoc');
    },
};
</script>