<template>
    <LoadingComponent v-if="isLoading" dataload="des absences" />
    <div v-else>
        <div class="header-title-table">
            <div>
                <a v-if="userStore.add" class="btn btn-success btn-lg" data-toggle="modal" data-target="#add_absence"> Ajouter </a>
                <button class="btn btn-dark btn-table btn-lg" id="tool" data-toggle="tooltip" data-placement="left" :title="tool" @click="dev_tab()">{{ label_but_dev_tab }}</button>
                <button class="btn btn-light btn-lg" @click="exportToExcel">Exporter vers Excel</button>
            </div>
            <SearchInput 
                :rech="texteRecherche"
                :choix_rech="critereRecherche"
                :options="options"
                @update:rech="texteRecherche = $event" 
                @update:choix_rech="critereRecherche = $event"
                @search="filtrer"
            />
        </div>
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="label_but_dev_tab === 'Développer' ? absences : absences_all" :label_but_dev_tab="label_but_dev_tab" :tool="tool" :show-actions="label_but_dev_tab !== 'Développer' && userStore.delet? true : false">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="l'absence" table-suppr="abs" :view_but_mod="false" :view_but_del="label_but_dev_tab === 'Développer' ? false : true" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modAbsence"/>
                    </template>
                </TableAction>
            </template>
        </TableComponent>
        <!-- Modal for adding a new absence -->
        <ModalComponent id="add_absence" title="Ajouter une absence">
            <div class="container">
                <div class="row">
                    <div class="col">
                        <label for="add_matricule">Numéro matricule:</label>
                        <input class="form-control"  type="text" v-model="add_matricule"/>
                    </div>
                    <div class="col">
                        <button class="btn btn-dark" style="margin-top: 29px;" @click="recovery_student">Voir</button>
                    </div>
                </div>
            </div>
            
            <FormComponent :inputs="input_add" label_button="Ajouter" @submit="addAbsence"/>
        </ModalComponent>
    </div>
</template>

<script>
import FormComponent from '@/components/formComponent.vue';
import LoadingComponent from '@/components/loadingComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import TableAction from '@/components/TableAction.vue';
import TableComponent from '@/components/TableComponent.vue';
import SearchInput from '@/components/SearchInput.vue';
import { useSubscribeStore } from '@/store/realtime';
import { useUserStore } from '@/store/user';
import { selectPromStore } from '@/store/selectProm';
import { supabase } from '@/supabase';
import { mapStores } from 'pinia';
import * as XLSX from 'xlsx';
import { debounce } from 'lodash';

export default {
    name: 'AbsenceEleve',
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
            data_before_search: [],
            data_all_before_search: [],
            add_matricule: '',
            options: [
                { value: 'nom', label: 'Nom et Prénom' },
            ],
            columns: [
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px'},
                { key: 'date_debut', label: 'date de debut de l\'absence / retard', style: 'min-width: 150px' },
                { key: 'date_fin', label: 'date de fin de l\'absence / retard', style: 'min-width: 150px' },
                { key: 'heure', label: 'Heure d\'arrivé', style: 'min-width: 150px' },
                { key: 'ctg', label: 'Catégorie', style: 'min-width: 150px' },
                { key: 'motif', label: 'Motif de l\'absence / retard', style: 'min-width: 150px' },
            ],
            columns2: [
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px', etat: true },
                { key: 'nb_absences', label: 'Nombre d\'absences', style: 'min-width: 150px' },
                { key: 'nb_retards', label: 'Nombre de retards', style: 'min-width: 150px' },
                { key: 'mesure', label: 'Mesures disciplinaires', style: 'min-width: 250px' },
            ],
            label_but_dev_tab: 'Développer',
            tool: 'Développer le tableau',
            initialValues: {},
            add_initialValue: this.getInitialForm(),
            ctgs: [
                { value: 'Absence', text: 'Absence' },
                { value: 'Retard', text: 'Retard' },
            ],
            absences: [],
            abs_sub: [],
            absences_all: [],
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        input_add() {
            return [
                { id: 'id_ele', type: 'hidden', initialValue: this.add_initialValue.id_ele },
                { id: 'nom', type: 'text', label: 'Nom et Prénom', placeholder: 'Le nom et prénom', initialValue: this.add_initialValue.nom, required: true , disabled: true},
                { id: 'filiere', type: 'text', label: 'Filière', placeholder: 'La filière', initialValue: this.add_initialValue.filiere, required: true , disabled: true},
                { id: 'genre', type: 'text', label: 'Genre', placeholder: 'Le genre', initialValue: this.add_initialValue.genre, required: true , disabled: true},
                { id: 'prom_ele', type: 'hidden', initialValue: this.add_initialValue.prom_ele},
                { id: 'ctg', type: 'select', label: 'Catégorie', placeholder: 'Sélectionnez la catégorie', initialValue: this.add_initialValue.ctg, options: this.ctgs, required: true },
                { id: 'date_debut', type: 'date', label: 'Date de debut de l\'absence / retard', initialValue: this.initialValues.date, required: true },
                { id: 'date_fin', type: 'date', label: 'Date de fin de l\'absence / retard', initialValue: this.initialValues.date, required: true },
                { id: 'heure', type: 'time', label: 'Heure d\'arrivé', initialValue: this.initialValues.heure, required: true },
                { id: 'motif', type: 'text', label: 'Motif', placeholder: 'Entrez le motif', initialValue: this.initialValues.motif, required: true },
                { id: 'mesure', type: 'text', label: 'Mesures disciplinaires', placeholder: 'Entrez les mesures disciplinaires', initialValue: this.add_initialValue.mesure, required: false }
            ];
        },
        input_mod() {
            return [
                { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
                { id: 'nom', type: 'text', label: 'Nom et Prénom', placeholder: 'Entrez le nom et prénom', initialValue: this.initialValues.nom, required: true },
                { id: 'ctg', type: 'select', label: 'Catégorie', placeholder: 'Sélectionnez la catégorie', initialValue: this.initialValues.ctg, options: this.ctgs, required: true },
                { id: 'date_debut', type: 'date', label: 'Date de debut de l\'absence', initialValue: this.initialValues.date, required: true },
                { id: 'date_fin', type: 'date', label: 'Date de fin de l\'absence', initialValue: this.initialValues.date, required: true },
                { id: 'heure', type: 'time', label: 'Heure d\'arrivé', initialValue: this.initialValues.heure, required: true },
                { id: 'motif', type: 'text', label: 'Motif', placeholder: 'Entrez le motif', initialValue: this.initialValues.motif, required: true },
                { id: 'mesure', type: 'text', label: 'Mesures disciplinaires', placeholder: 'Entrez les mesures disciplinaires', initialValue: this.initialValues.mesure, required: false },
            ];
        },
    },
    watch: {
        abs_sub: {
            deep: true,
            handler() {
                if(this.texteRecherche === ''){
                    this.debouncedGetAbsences();
                }
                else{
                    this.filtrer();
                }
            }
        }
    },
    methods: {
        async getfirstAbsence(){
            this.isLoading = true;
            await this.getAbsences();
        },
        async getAllDataAbsences() {
            try{
                const { data, error } = await supabase
                    .from('abs')
                    .select('*')
                    .order('id', { ascending: false });

                if (error) throw error;

                this.abs_sub = data;

            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                this.abs_sub = [];
            }
        },
        async getAbsences() {
            try {
                const { data, error } = await supabase
                    .from('abs')
                    .select('*')
                    .order('id', { ascending: false });
                if (error) throw error;

                const aggregatedData = [];
                const uniqueId_ele = [...new Set(data.map(item => item.id_ele))];
                
                for (const id_ele of uniqueId_ele) {
                    const records = data.filter(item => item.id_ele === id_ele);
                    const nbAbsences = records.filter(item => item.ctg === 'Absence').length;
                    const nbRetards = records.filter(item => item.ctg === 'Retard').length;
                                        
                    aggregatedData.push({
                        id: records[0].id,
                        nom: records[0].nom,
                        id_ele: id_ele,
                        nb_absences: nbAbsences,
                        nb_retards: nbRetards,
                        mesure: records[0].mesure
                    });
                }

                this.absences = aggregatedData;
                this.data_before_search = aggregatedData;

                this.absences_all = data;
                this.data_all_before_search = data;

                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des absences:', error);
                this.absences = [];
                this.isLoading = false; 
            }
        },
        debouncedGetAbsences: debounce(function () {
            this.getAbsences();
        }, 300),
        async filtrer() {
            if (this.texteRecherche === '') {
                this.getAbsences();
                this.getAllDataAbsences();
                this.isLoading = false;
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('abs')
                    .select('*')
                    .ilike(this.critereRecherche, `%${this.texteRecherche}%`)
                    .order('id', { ascending: false });
                if (error) throw error;
                const aggregatedData = [];
                const uniqueId_ele = [...new Set(data.map(item => item.id_ele))];
                
                for (const id_ele of uniqueId_ele) {
                    const records = data.filter(item => item.id_ele === id_ele);
                    const nbAbsences = records.filter(item => item.ctg === 'Absence').length;
                    const nbRetards = records.filter(item => item.ctg === 'Retard').length;
                                        
                    aggregatedData.push({
                        id: records[0].id,
                        nom: records[0].nom,
                        id_ele: id_ele,
                        nb_absences: nbAbsences,
                        nb_retards: nbRetards,
                        mesure: records[0].mesure
                    });
                }

                this.absences = aggregatedData;
                this.absences_all = data;
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la recherche des absences:', error);
                this.absences = [];
            }
        },
        getInitialForm() {
            return {
                id_ele: '',
                nom: '',
                filiere: '',
                genre: '',
                ctg: 'Absence',
                date: '',
                mesure: '',
                comment: '',
            };
        },
        async recovery_student() {
            if (this.add_matricule === '') {
                alert('Veuillez entrer un numéro matricule.');
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('infoc')
                    .select('id, nom, filiere, genre, prom_ele')
                    .eq('rang', this.add_matricule)
                    .single();
                if (error) throw error;

                if (data) {
                    this.add_initialValue.id_ele = data.id;
                    this.add_initialValue.nom = data.nom;
                    this.add_initialValue.filiere = data.filiere;
                    this.add_initialValue.genre = data.genre;
                    this.add_initialValue.prom_ele = data.prom_ele;
                    this.add_initialValue.id = data.id;
                } else {
                    alert('Aucun étudiant trouvé avec ce numéro matricule.');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'étudiant:', error);
                alert('Erreur lors de la récupération de l\'étudiant.');
            }
        },
        async addAbsence(data) {
            try {
                const { error } = await supabase.from('abs').insert([data]);
                if (error) throw error;
                alert('Absence ajoutée avec succès !');
                this.add_initialValue = this.getInitialForm();
            } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'absence:', error);
                alert('Erreur lors de l\'ajout de l\'absence.');
            }
            this.getAbsences();
        },
        dataInitialFormMod(item) {
            this.initialValues = item;
        },
        async modAbsence(data) {
            try {
                const { error } = await supabase
                    .from('abs')
                    .update(data)
                    .eq('id', this.initialValues.id);
                if (error) throw error;
                alert('Absence modifiée avec succès !');
                await this.getAbsences();
            } catch (error) {
                console.error('Erreur lors de la modification de l\'absence:', error);
                alert('Erreur lors de la modification de l\'absence.');
            }
        },
        dev_tab() {
            this.label_but_dev_tab = this.label_but_dev_tab === 'Développer' ? 'Réduire' : 'Développer';
            this.tool = this.label_but_dev_tab === 'Développer' ? 'Développer le tableau' : 'Réduire le tableau';
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('abs', 'abs_sub', this);
        },
        exportToExcel() {
            let worksheetData = [];
            if( this.label_but_dev_tab === 'Développer') {
                worksheetData = this.absences.map(item => {
                const row = {};
                this.columns2.forEach(col => {
                    row[col.label] = item[col.key] || '';
                });
                return row;
            });
            }else{
                worksheetData = this.absences_all.map(item => {
                const row = {};
                this.columns.forEach(col => {
                    row[col.label] = item[col.key] || '';
                });
                return row;
            });
            }
            const ws = XLSX.utils.json_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Absences');
            const fileName = 'Absences.xlsx';
            XLSX.writeFile(wb, fileName);
        },
    },
    async mounted() {
        this.subscribeToTable();
        this.debouncedGetAbsences();
        this.getAllDataAbsences();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('abs', 'abs_sub');
    },
};
</script>