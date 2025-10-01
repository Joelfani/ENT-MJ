<template>
    <LoadingComponent v-if="isLoading" dataload="des élèves" />
    <div v-else>
        <div class="header-title-table">
            <div class="">
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
        
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="eleves">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="l'élève"  table-suppr="infoc" :notSuppr=true tableEdit="infoc" @loadData="loadData" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modEleve"/>
                    </template>
                </TableAction>
            </template>
        </TableComponent>
    </div>
</template>

<script>
import FormComponent from '@/components/formComponent.vue';
import LoadingComponent from '@/components/loadingComponent.vue';
import TableAction from '@/components/TableAction.vue';
import TableComponent from '@/components/TableComponent.vue';
import SearchInput from '@/components/SearchInput.vue';
import { useSubscribeStore } from '@/store/realtime';
import { useUserStore } from '@/store/user';
import { selectPromStore } from '@/store/selectProm';
import { supabase } from '@/supabase';
import { mapStores } from 'pinia';
import * as XLSX from "xlsx";
import { debounce } from 'lodash';

export default {
    name: 'StudentList',
    components: {
        TableComponent,
        LoadingComponent,
        TableAction,
        FormComponent,
        
        SearchInput,
    },
    data() {
        return {
            isLoading: true,
            texteRecherche: '',
            critereRecherche: 'rang',
            data_before_search: [],
            options: [
                { value: 'rang', label: 'Matricule' },
                { value: 'nom', label: 'Nom et Prénom' },
                { value: 'filiere', label: 'Filière' },
            ],
            eleves: [],
            columns: [
                    { key: 'rang', label: 'Matricule', style: 'min-width: 150px'},
                    { key: 'nom', label: "Nom et Prénom", style: 'min-width: 250px' , etat:true},
                    { key: 'prenom', label: "Prénom d'usage", style: 'min-width: 150px' },
                    { key: 'filiere', label: "Filière", style: 'min-width: 100px' },
                    { key: 'filiere2', label: "Voeux spécialisation à l'inscription", style: 'min-width: 250px' },
                    { key: 'etat_ele', label: 'Situation', style: 'min-width: 150px' },
                    { key: 'genre', label: "Genre", style: 'min-width: 100px' },
                    { key: 'naiss', label: "Date de naissance", style: 'min-width: 150px' },
                    { key: 'lieu', label: "Lieu de naissance", style: 'min-width: 150px' },
                    { key: 'age', label: "Âge", style: 'min-width: 100px' },
                    { key: 'tel', label: "Téléphone", style: 'min-width: 150px' },
                    { key: 'adresse', label: "Adresse", style: 'min-width: 200px' },
                    { key: 'niveau', label: "Dernière classe suivie", style: 'min-width: 200px' },
                    { key: 'diplome', label: "Dernier diplôme obtenu", style: 'min-width: 200px' },
                    { key: 'etab', label: "Dernier établissement", style: 'min-width: 250px' },
                    { key: 'resp', label: "Tuteur", style: 'min-width: 250px' },
                    { key: 'respnom', label: "Nom et prénom du tuteur", style: 'min-width: 300px' },
                    { key: 'lien', label: "Lien avec le tuteur", style: 'min-width: 250px' },
                    { key: 'situation', label: "Situation d'hébergement", style: 'min-width: 250px' },
                    { key: 'tel2', label: "N° tél personne responsable", style: 'min-width: 250px' },
                    { key: 'fb', label: "Contact FB", style: 'min-width: 250px' },
                    { key: 'ville', label: "Ville d'origine", style: 'min-width: 250px' },
                    { key: 'finance', label: "Financement des écolages", style: 'min-width: 250px' },
                    { key: 'pro1', label: "Profession du père", style: 'min-width: 250px' },
                    { key: 'pro2', label: "Profession de la mère", style: 'min-width: 250px' },
                    { key: 'pro3', label: "Profession du tuteur", style: 'min-width: 250px' },
                    { key: 'pres', label: "Situation matrimoniale", style: 'min-width: 250px' },
                    { key: 'frat', label: "Enfants dans fratrie", style: 'min-width: 250px' },
                    { key: 'frat2', label: "Place dans la fratrie", style: 'min-width: 250px' },
                    { key: 'revenu', label: "Revenu mensuel moyen du foyer", style: 'min-width: 250px' },
                    { key: 'autre', label: "Dossiers manquants", style: 'min-width: 250px' },
                    { key: 'comment', label: "Commentaires/info supplémentaire", style: 'min-width: 250px' }
            ],
            columns2: [
                { key: 'rang', label: 'Matricule', style: 'min-width: 70px' },
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' },
                { key: 'prenom', label: "Prénom d'usage", style: 'min-width: 150px' },
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
                { key: 'filiere2', label: "Voeux spécialisation à l'inscription", style: 'min-width: 250px' },
                { key: 'etat_ele', label: 'Situation', style: 'min-width: 150px' },
            ],
            label_but_dev_tab: 'Développer',
            tool: 'Développer le tableau',
            initialValues: {},
            filiere: [],
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        input_mod() {
            return [
        //{ id: 'id', type: 'hidden', initialValue: this.initialValues.id },
        { id: 'rang', type: 'number', label: 'Matricule', placeholder: 'Entrez le matricule',initialValue: this.initialValues.rang},
        { id: 'etat_ele', type: 'select', label: "Situation:", initialValue: this.initialValues.etat_ele, options: [
            { value: 'En cours', text: 'En cours' },
            { value: 'Diplômé', text: 'Diplômé' },
            { value: 'Abandon', text: 'Abandon' },
            { value: 'Exclu', text: 'Exclu' },
        ], required: true },
        { id: 'motif_etat_ele', type: 'text', label: "Motif et date de renvoi ou d'abandon:", placeholder: "Entrez le motif et la date de renvoi ou d'abandon", initialValue: this.initialValues.motif_etat_ele},
        { id: 'nom', type: 'text', label: "Nom et Prénom", placeholder: "Entrez le nom et prénom", initialValue: this.initialValues.nom, required: true },
        { id: 'prenom', type: 'text', label: "Prénom d'usage", placeholder: "Entrez le prénom d'usage", initialValue: this.initialValues.prenom, required: false },
        { id: 'filiere', type: 'select', label: "Filière", placeholder: "Entrez la filière", initialValue: this.initialValues.filiere,
            options: this.filiere.map(item => ({
                value: item.nom,
                text: item.nomlong
            })),
            required: true
        },
        { id: 'filiere2', type: 'select', label: "Voeux spécialisation à l'inscription", placeholder: "Entrez les vœux de spécialisation", initialValue: this.initialValues.filiere2,
            options: [
                ...this.filiere.map(item => ({
                    value: item.nom,
                    text: item.nomlong
                })),
                { value: 'Non spécifié', text: 'Non spécifié' }
            ],
            required: true
        },
        { id: 'genre', type: 'select', label: "Genre", initialValue: this.initialValues.genre, options: [
            { value: 'M', text: 'Masculin' },
            { value: 'F', text: 'Féminin' }
        ], required: true },
        { id: 'naiss', type: 'date', label: "Date de naissance", initialValue: this.initialValues.naiss, required: false },
        { id: 'lieu', type: 'text', label: "Lieu de naissance", placeholder: "Entrez le lieu de naissance", initialValue: this.initialValues.lieu, required: false },
        { id: 'tel', type: 'text', label: "Téléphone", placeholder: "Entrez le numéro de téléphone", initialValue: this.initialValues.tel, required: false },
        { id: 'adresse', type: 'text', label: "Adresse", placeholder: "Entrez l'adresse", initialValue: this.initialValues.adresse, required: false },
        { id: 'niveau', type: 'select', label: "Dernière classe suivie", placeholder: "Entrez la dernière classe suivie", initialValue: this.initialValues.niveau,
            options: [
                { value: '6ème', text: '6ème' },
                { value: '5ème', text: '5ème' },
                { value: '4ème', text: '4ème' },
                { value: '3ème', text: '3ème' },
                { value: '2nde', text: '2nde' },
                { value: '1ère', text: '1ère' },
                { value: 'Terminale', text: 'Terminale' }
            ], required: false
        },
        { id: 'diplome', type: 'select', label: "Dernier diplôme obtenu", placeholder: "Entrez le dernier diplôme obtenu", initialValue: this.initialValues.diplome, options: [
            { value: 'AUCUN', text: 'AUCUN' },
            { value: 'CEPE', text: 'CEPE' },
            { value: 'BEPC', text: 'BEPC' },
            { value: 'BACC', text: 'BACC' },
            { value: 'AUTRE', text: 'AUTRE' }
        ], required: false },
        { id: 'etab', type: 'text', label: "Dernier établissement", placeholder: "Entrez le dernier établissement", initialValue: this.initialValues.etab, required: false },
        { id: 'resp', type: 'text', label: "Tuteur(personne résponsable)/organisme responsable:", placeholder: "Entrez le tuteur", initialValue: this.initialValues.resp, required: false },
        { id: 'respnom', type: 'text', label: "Nom et prénom du tuteur", placeholder: "Entrez le nom et prénom du tuteur", initialValue: this.initialValues.respnom, required: false },
        { id: 'lien', type: 'text', label: "Lien avec le tuteur", placeholder: "Entrez le lien avec le tuteur", initialValue: this.initialValues.lien, required: false },
        { id: 'situation', type: 'text', label: "Situation d'hébergement", placeholder: "Entrez la situation d'hébergement", initialValue: this.initialValues.situation, required: false },
        { id: 'tel2', type: 'text', label: "N° tél personne responsable", placeholder: "Entrez le numéro de téléphone du responsable", initialValue: this.initialValues.tel2, required: false },
        { id: 'fb', type: 'text', label: "Contact FB", placeholder: "Entrez le contact Facebook", initialValue: this.initialValues.fb, required: false },
        { id: 'ville', type: 'text', label: "Ville d'origine", placeholder: "Entrez la ville d'origine", initialValue: this.initialValues.ville, required: false },
        { id: 'finance', type: 'text', label: "Financement des écolages", placeholder: "Entrez les informations de financement", initialValue: this.initialValues.finance, required: false },
        { id: 'pro1', type: 'text', label: "Profession du père", placeholder: "Entrez la profession du père", initialValue: this.initialValues.pro1, required: false },
        { id: 'pro2', type: 'text', label: "Profession de la mère", placeholder: "Entrez la profession de la mère", initialValue: this.initialValues.pro2, required: false },
        { id: 'pro3', type: 'text', label: "Profession du tuteur", placeholder: "Entrez la profession du tuteur", initialValue: this.initialValues.pro3, required: false },
        { id: 'pres', type: 'text', label: "Situation matrimoniale", placeholder: "Entrez la situation matrimoniale", initialValue: this.initialValues.pres, required: false },
        { id: 'frat', type: 'text', label: "Enfants dans fratrie", placeholder: "Entrez le nombre d'enfants dans la fratrie", initialValue: this.initialValues.frat, required: false },
        { id: 'frat2', type: 'text', label: "Place dans la fratrie", placeholder: "Entrez la place dans la fratrie", initialValue: this.initialValues.frat2, required: false },
        { id: 'revenu', type: 'text', label: "Revenu mensuel moyen du foyer", placeholder: "Entrez le revenu mensuel moyen", initialValue: this.initialValues.revenu, required: false },
        { id: 'autre', type: 'text', label: "Dossiers manquants", placeholder: "Entrez les dossiers manquants", initialValue: this.initialValues.autre, required: false },
        { id: 'comment', type: 'textarea', label: "Commentaires/info supplémentaire", placeholder: "Entrez les commentaires ou informations supplémentaires", initialValue: this.initialValues.comment, required: false }
    ];
        },
    },
    watch: {
        'selectPromStore.promotion_selected': {
            handler() {
                this.debouncedGetEleves();
            },
            immediate: true,
        },
    },
    methods: {
        async getFirstEleves() {
            this.isLoading = true;
            await this.getEleves();
        },
        async getEleves() {
            try {
                const { data, error } = await supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('rang', { ascending: false });
                if (error) throw error;
                
                this.eleves = data;
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des élèves:', error);
                this.eleves = [];
                this.isLoading = false;
            }
        },
        debouncedGetEleves: debounce(function () {
            this.getEleves();
        }, 300),
        async filtrer() {
            if (this.texteRecherche === '') {
                this.getEleves();
                return;
            }
            try {
                const query = supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('id', { ascending: false });
                
                if (this.critereRecherche === 'nom') {
                    query.ilike('nom', `%${this.texteRecherche}%`);
                } else {
                    query.eq(this.critereRecherche, this.texteRecherche.toUpperCase());
                }
                
                const { data, error } = await query;
                if (error) throw error;

                this.eleves = data;
            } catch (error) {
                console.error('Erreur lors de la recherche des élèves:', error);
                this.eleves = [];
            }
        },
        dev_tab() {
            this.label_but_dev_tab = this.label_but_dev_tab === 'Développer' ? 'Réduire' : 'Développer';
            this.tool = this.label_but_dev_tab === 'Développer' ? 'Développer le tableau' : 'Réduire le tableau';
        },
        async getFiliere() {
            try {
                const { data, error } = await supabase
                    .from('filiere')
                    .select('*')
                    .order('id', { ascending: true });
                if (error) throw error;
                this.filiere = data;
            } catch (error) {
                console.error('Erreur lors de la récupération des filières:', error);
                this.filiere = [];
            }
        },
        dataInitialFormMod(item) {
            this.initialValues = item;
        },
        async modEleve(data) {
            const doubleData = await supabase
                .from('infoc')
                .select('*')
                .eq('nom', data.nom)
                .neq('id', this.initialValues.id);
            if (doubleData.data.length > 0) {
                alert('Une élève avec ce nom existe déjà');
                return;
            } else {
            try {
                const { error } = await supabase
                    .from('infoc')
                    .update(data)
                    .eq('id', this.initialValues.id);
                if (error) throw error;
                
                alert('Élève modifié avec succès !');
            } catch (error) {
                console.error('Erreur lors de la modification de l\'élève:', error);
                alert('Erreur lors de la modification de l\'élève.');
            }
        }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('infoc', 'eleves', this,'rang','desc');
        },
        exportToExcel() {
            const worksheetData = this.eleves.map(item => {
                const row = {};
                this.columns.forEach(col => {
                    if (col.key === 'naiss') {
                        row[col.label] = item[col.key] ? new Date(item[col.key]).toLocaleDateString('fr-FR') : '';
                    } else {
                        row[col.label] = item[col.key] || '';
                    }
                });
                return row;
            });
            const data = worksheetData;
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Élèves');
            const fileName = 'Élèves.xlsx';
            XLSX.writeFile(wb, fileName);

        },
        loadData() {
            this.getEleves();
        },
    },
    async mounted() {
        this.subscribeToTable();
        await this.getFiliere();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('infoc', 'eleves');
    },
};
</script>