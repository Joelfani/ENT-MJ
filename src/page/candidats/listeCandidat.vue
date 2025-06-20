<template>
    <LoadingComponent v-if="isLoading" dataload="des candidats" />
    <div v-else>
        <div class="header-title-table">
            <div class="">
                <button class="btn btn-dark btn-table btn-lg" id="tool" data-toggle="tooltip" data-placement="left" :title="tool" @click="dev_tab()">{{ label_but_dev_tab }}</button>
                <a v-if="userStore.add" class="btn btn-success btn-lg" data-toggle="modal" data-target="#add_candidat"> Ajouter </a>
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
            <!-- "texteRecherche = $event" = Je prends la valeur envoyée (dans $event) et je la stocke dans texteRecherche -->
        </div>
        
        
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="candidats">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="le candidat" table-suppr="infoc" tableEdit="infoc" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modCandidat"/>
                    </template>
                </TableAction>
            </template>
        </TableComponent>
        <!--Modal for adding a new candidat-->
        <ModalComponent id="add_candidat" title="Ajouter un candidat">
            <FormComponent :inputs="input_add" label_button="Ajouter" @submit="addCandidat"/>
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
    name: 'CandidatEleve',
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
                { value: 'nom', label: 'Nom et Prénom' },
                { value: 'filiere', label: 'Filière' },
            ],
            candidats: [],
            columns: [
                    { key: 'nom', label: "Nom et Prénom", style: 'min-width: 250px' , etat:true},
                    { key: 'prenom', label: "Prénom d'usage", style: 'min-width: 150px' },
                    { key: 'filiere', label: "Filière", style: 'min-width: 100px' },
                    { key: 'filiere2', label: "Voeux spécialisation à l'inscription", style: 'min-width: 250px' },
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
            columns2:[
                    { key: 'nom', label: "Nom et Prénom", style: 'min-width: 250px'},
                    { key: 'prenom', label: "Prénom d'usage", style: 'min-width: 150px' },
                    { key: 'filiere', label: "Filière", style: 'min-width: 100px' },
                    { key: 'filiere2', label: "Voeux spécialisation à l'inscription", style: 'min-width: 250px' },
            ],
            label_but_dev_tab: 'Développer',
            tool: 'Développer le tableau',
            initialValues: {},
            add_initialValue: this.getInitialForm(),
            filiere: [],
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore,selectPromStore),
        input_add() {
            return [
                { id: 'nom', type: 'text', label: "Nom et Prénom", placeholder: "Entrez le nom et prénom", initialValue: this.add_initialValue.nom, required: true },
                { id: 'prenom', type: 'text', label: "Prénom d'usage", placeholder: "Entrez le prénom d'usage", initialValue: this.add_initialValue.prenom, required: false },
                { id: 'filiere', type: 'select', label: "Filière", placeholder: "Entrez la filière", initialValue: this.add_initialValue.filiere,
                options: 

                    this.filiere.map(item => ({
                        value: item.nom,
                        text: item.nomlong
                    })),
                required: true },
                { id: 'filiere2', type: 'select', label: "Voeux spécialisation à l'inscription", placeholder: "Entrez les vœux de spécialisation", initialValue: this.add_initialValue.filiere2, 
                options: 
                [
                    ...this.filiere.map(item => ({
                    value: item.nom,
                    text: item.nomlong
                    })),
                    { value: 'Non spécifié', text: 'Non spécifié' }
                ],
                required: true },
                { id: 'genre', type: 'select', label: "Genre", initialValue: this.add_initialValue.genre, options: [
                    { value: 'M', text: 'Masculin' },
                    { value: 'F', text: 'Féminin' }
                ], required: true },
                { id: 'naiss', type: 'date', label: "Date de naissance", initialValue: this.add_initialValue.naiss, required: false },
                { id: 'lieu', type: 'text', label: "Lieu de naissance", placeholder: "Entrez le lieu de naissance", initialValue: this.add_initialValue.lieu, required: false },
                { id: 'tel', type: 'text', label: "Téléphone", placeholder: "Entrez le numéro de téléphone", initialValue: this.add_initialValue.tel, required: false },
                { id: 'adresse', type: 'text', label: "Adresse", placeholder: "Entrez l'adresse", initialValue: this.add_initialValue.adresse, required: false },
                { id: 'niveau', type: 'select', label: "Dernière classe suivie", placeholder: "Entrez la dernière classe suivie", initialValue: this.add_initialValue.niveau,
                options: [
                    { value: '6ème', text: '6ème' },
                    { value: '5ème', text: '5ème' },
                    { value: '4ème', text: '4ème' },
                    { value: '3ème', text: '3ème' },
                    { value: '2nde', text: '2nde' },
                    { value: '1ère', text: '1ère' },
                    { value: 'Terminale', text: 'Terminale' }

                ], required: false },
                { id: 'diplome', type: 'select', label: "Dernier diplôme obtenu", placeholder: "Entrez le dernier diplôme obtenu", initialValue: this.add_initialValue.diplome,options: [
                    { value: 'AUCUN', text: 'AUCUN' },
                    { value: 'CEPE', text: 'CEPE' },
                    { value: 'BEPC', text: 'BEPC' },
                    { value: 'BACC', text: 'BACC' },
                    { value: 'AUTRE', text: 'AUTRE' }, 

                ], required: false },
                { id: 'etab', type: 'text', label: "Dernier établissement", placeholder: "Entrez le dernier établissement", initialValue: this.add_initialValue.etab, required: false },
                { id: 'resp', type: 'text', label: "Tuteur(personne résponsable)/organisme responsable:", placeholder: "Entrez le tuteur", initialValue: this.add_initialValue.resp, required: false },
                { id: 'respnom', type: 'text', label: "Nom et prénom du tuteur", placeholder: "Entrez le nom et prénom du tuteur", initialValue: this.add_initialValue.respnom, required: false },
                { id: 'lien', type: 'text', label: "Lien avec le tuteur", placeholder: "Entrez le lien avec le tuteur", initialValue: this.add_initialValue.lien, required: false },
                { id: 'situation', type: 'text', label: "Situation d'hébergement", placeholder: "Entrez la situation d'hébergement", initialValue: this.add_initialValue.situation, required: false },
                { id: 'tel2', type: 'text', label: "N° tél personne responsable", placeholder: "Entrez le numéro de téléphone du responsable", initialValue: this.add_initialValue.tel2, required: false },
                { id: 'fb', type: 'text', label: "Contact FB", placeholder: "Entrez le contact Facebook", initialValue: this.add_initialValue.fb, required: false },
                { id: 'ville', type: 'text', label: "Ville d'origine", placeholder: "Entrez la ville d'origine", initialValue: this.add_initialValue.ville, required: false },
                { id: 'finance', type: 'text', label: "Financement des écolages", placeholder: "Entrez les informations de financement", initialValue: this.add_initialValue.finance, required: false },
                { id: 'pro1', type: 'text', label: "Profession du père", placeholder: "Entrez la profession du père", initialValue: this.add_initialValue.pro1, required: false },
                { id: 'pro2', type: 'text', label: "Profession de la mère", placeholder: "Entrez la profession de la mère", initialValue: this.add_initialValue.pro2, required: false },
                { id: 'pro3', type: 'text', label: "Profession du tuteur", placeholder: "Entrez la profession du tuteur", initialValue: this.add_initialValue.pro3, required: false },
                { id: 'pres', type: 'text', label: "Situation matrimoniale", placeholder: "Entrez la situation matrimoniale", initialValue: this.add_initialValue.pres, required: false },
                { id: 'frat', type: 'text', label: "Enfants dans fratrie", placeholder: "Entrez le nombre d'enfants dans la fratrie", initialValue: this.add_initialValue.frat, required: false },
                { id: 'frat2', type: 'text', label: "Place dans la fratrie", placeholder: "Entrez la place dans la fratrie", initialValue: this.add_initialValue.frat2, required: false },
                { id: 'revenu', type: 'text', label: "Revenu mensuel moyen du foyer", placeholder: "Entrez le revenu mensuel moyen", initialValue: this.add_initialValue.revenu, required: false },
                { id: 'autre', type: 'text', label: "Dossiers manquants", placeholder: "Entrez les dossiers manquants", initialValue: this.add_initialValue.autre, required: false },
                { id: 'comment', type: 'textarea', label: "Commentaires/info supplémentaire", placeholder: "Entrez les commentaires ou informations supplémentaires", initialValue: this.add_initialValue.comment, required: false },
            ];
        },
        input_mod() {
    return [
        { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
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
}


    },
    watch: {
        'selectPromStore.promotionCan_selected': {
            handler() {
                this.getCandidats();
            },
            immediate: true,// Le handler est exécuté directement lorsque le composant est monté
        },

    },
    methods: {
        async getCandidats() {
            this.isLoading = true;
            try {
                const { data, error } = await supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom', this.selectPromStore.promotionCan_selected)
                    .order('id', { ascending: false });
                if (error) throw error;
                
                this.candidats = data;

                this.data_before_search = data; // Stocker les données avant la recherche
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des candidats:', error);
                this.candidats = [];
                this.isLoading = false;
            }
        },
        async filtrer() {   
                if (this.critereRecherche === 'nom') {
                    try {
                    const { data, error } = await supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom', this.selectPromStore.promotionCan_selected)
                    .ilike(this.critereRecherche, `%${this.texteRecherche}%`)
                    .order('id', { ascending: false });
                    if (error) throw error;
                    this.candidats = data;
                    
                    }catch (error) {
                        console.error('Erreur lors de la recherche des candidats:', error);
                        this.candidats = [];
                    }
                }
                else {
                    if (this.texteRecherche === '') {
                        this.candidats = this.data_before_search;
                        return;
                    }else{
                        try {
                        const { data, error } = await supabase
                        .from('infoc')
                        .select('*')
                        .eq('prom', this.selectPromStore.promotionCan_selected)
                        .eq(this.critereRecherche, `${this.texteRecherche.toUpperCase()}`)
                        .order('id', { ascending: false });
                        if (error) throw error;
                        this.candidats = data;
                        }catch (error) {
                            console.error('Erreur lors de la recherche des candidats:', error);
                            this.candidats = [];
                        }
                    }
                    
                }
        },
        dev_tab() {
            if (this.label_but_dev_tab === 'Développer') {
                this.label_but_dev_tab = 'Réduire';
                this.tool = 'Réduire le tableau';
            } else {
                this.label_but_dev_tab = 'Développer';
                this.tool = 'Développer le tableau';
            }
        },
        async getFiliere() {
            try {
                const { data, error } = await supabase
                    .from('filiere')
                    .select('*')
                    .order('id', { ascending: true });
                if (error) throw error;
                this.filiere = data;
                return data;
            } catch (error) {
                console.error('Erreur lors de la récupération des filières:', error);
                return [];
            }
        },
        getInitialForm() {
            return {
                nom: '',
                prenom: '',
                filiere: '',
                filiere2: '',
                prom: '',
                genre: 'M',
                naiss: '',
                tel: '',
                adresse: '',
                mail: '',
                obs: '',
                age: '',
                lieu: '',
                niveau: '6ème',
                diplome: 'AUCUN',
                resp: '',
                respnom: '',
                lien: '',
                situation: '',
                tel2: '',
                fb: '',
                ville: '',
                etab: '',
                finance: '',
                etat: '',
                pro1: '',
                pro2: '',
                pro3: '',
                pres: '',
                log: '',
                frat: '',
                frat2: '',
                
                revenu: '',
                fixe: '',
                autre: '',
                comment: '',
                frso: '',
                frse: '',
                maths: '',
                ang: '',
                motiv: '',
                obs2: '',
            };
            },
        async addCandidat(data) {
            const doubleData = await supabase
                .from('infoc')
                .select('*')
                .eq('nom', data.nom)
            console.log('Données à DOUBLE:', doubleData);            
            if (doubleData.data.length > 0) {
                alert('Un candidat avec ce nom existe déjà.');
                return;
            } else {
                try {
                    data.prom = this.selectPromStore.promotionCan_selected;
                    if(data.naiss){
                        const birthDate = new Date(data.naiss);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        data.age = age;
                    }
                    const { error } = await supabase.from('infoc').insert([data]);
                    if (error) {
                        throw error;
                    }
                    alert('Candidat ajouté avec succès !');
                    // Reset form
                    this.add_initialValue = this.getInitialForm();
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du candidat:', error);
                }
            }
        },

        dataInitialFormMod(item) {
            this.initialValues = item;
        },
        async modCandidat(data) {
            const doubleData = await supabase
                .from('infoc')
                .select('*')
                .eq('nom', data.nom)
                .neq('id', this.initialValues.id);
            if (doubleData.data.length > 0) {
                alert('Un candidat avec ce nom existe déjà.');
                return;
            } else {
                try {
                    const { error } = await supabase
                        .from('infoc')
                        .update(data)
                        .eq('id', this.initialValues.id);
                    alert('Candidat modifié avec succès !');
                    if (error) {
                        throw error;
                    }
                } catch (error) {
                    console.error('Erreur lors de la modification du candidat:', error);
                }
            }
        },
        // Méthode pour souscrire aux changements en temps réel
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('infoc', 'candidats', this);
        },
        exportToExcel() {
            // Map data to include only fields in columns
            const worksheetData = this.candidats.map(item => {
                const row = {};
                this.columns.forEach(col => {
                if (col.id === 'naiss') {
                    // Format date for Excel
                    row[col.label] = item[col.key] ? new Date(item[col.id]).toLocaleDateString('fr-FR') : '';
                } else {
                    row[col.label] = item[col.key] || '';
                }
                });
                return row;
            });
            console.log('Données pour Excel:', worksheetData);
            
            const data = worksheetData;
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Candidats');
            const fileName = 'Candidats.xlsx';
            XLSX.writeFile(wb, fileName);
        },
    },
    async mounted() {
        await this.getCandidats();
        this.subscribeToTable();
        await this.getFiliere();
    },

    beforeUnmount() {
        // Nettoyer la souscription
        this.realtimeStore.unsubscribeFromTable('candidat');
    },
};
</script>