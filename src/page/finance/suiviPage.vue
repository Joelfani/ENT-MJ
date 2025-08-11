    <template>
    <LoadingComponent 
        v-if="isLoading" 
        dataload="des suivis de paiements" 
    />
    <div v-else>
        <div class="header-title-table">
        <div>
            <button 
            class="btn btn-light btn-lg" 
            @click="exportToExcel"
            >
            Exporter vers Excel
            </button>
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
        
        <TableComponent 
        :columns="columns" 
        :rows="suiviPaiements"
        >
        <template #actions="{ item }">
            <TableAction 
            :id="item.id" 
            title="le paiement" 
            :view_but_del="false" 
            :notSuppr="true" 
            tableEdit="payment" 
            @mod_data="dataInitialFormMod"
            >
            <template #form_modifier>
                <FormComponent 
                :inputs="input_mod" 
                label_button="Modifier" 
                @submit="modPaiement"
                />
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
    import * as XLSX from 'xlsx';
    import { debounce } from 'lodash';

    export default {
    name: 'SuiviPaiementsList',
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
        critereRecherche: 'nom',
        data_before_search: [],
        options: [
            { value: 'nom', label: 'Nom et Prénom' },
            { value: 'montant', label: 'Montant' },
            { value: 'categorie', label: 'Catégorie' },
        ],
        suiviPaiements: [],
        columns: [
            { key: 'time', label: 'Date', style: 'min-width: 150px' },
            { key: 'montant', label: 'Montant', style: 'min-width: 150px' },
            { key: 'nom', label: "Nom de l'élève", style: 'min-width: 250px', etat: true },
            { key: 'descriptif', label: 'Descriptif du paiement', style: 'min-width: 200px' },
        ],
        initialValues: {},
        categories: [
            { key: 'droit_inscription', label: "Droit d'inscription" },
            { key: 'carnet_1', label: 'Carnet de correspondance (année 1)' },
            { key: 'assurances_1', label: 'Assurances (année 1)' },
            { key: 'ecole_parents', label: 'Ecole des parents' },
            { key: 'uniforme_1', label: "Uniforme de l'école (1ère tranche)" },
            { key: 'uniforme_2', label: "Uniforme de l'école (2ème tranche)" },
            { key: 'uniforme_3', label: "Uniforme de l'école (3ème tranche)" },
            { key: 'carnet_2', label: 'Carnet de correspondance (année 2)' },
            { key: 'assurances_2', label: 'Assurances (année 2)' },
        ],
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        input_mod() {
        return [
            { 
            id: 'time', 
            type: 'text', 
            label: 'Date', 
            initialValue: this.initialValues.time, 
            disabled: true 
            },
            { 
            id: 'montant', 
            type: 'number', 
            label: 'Montant', 
            placeholder: 'Entrez le montant', 
            initialValue: this.initialValues.montant 
            },
            { 
            id: 'nom', 
            type: 'text', 
            label: "Nom de l'élève", 
            initialValue: this.initialValues.nom, 
            disabled: true 
            },
            { 
            id: 'categorie', 
            type: 'select', 
            label: 'Catégorie', 
            initialValue: this.initialValues.categorie,
            options: this.categories.map(cat => ({
                value: cat.key,
                text: cat.label,
            })),
            },
        ];
        },
    },
    watch: {
        'selectPromStore.promotion_selected': {
        handler() {
            this.debouncedGetSuiviPaiements();
        },
        },
    },
    methods: {
        async getFirstSuiviPaiements() {
        this.isLoading = true;
        await this.getSuiviPaiements();
        },
        async getSuiviPaiements() {
        try {
            const { data, error } = await supabase
            .from('payment')
            .select('id, time, montant, ele_id, categorie, infoc!ele_id(nom)')
            .order('time', { ascending: false })
            .order('id', { ascending: false });
            if (error) throw error;

            this.suiviPaiements = data.map(payment => ({
            ...payment,
            nom: payment.infoc?.nom || '',
            descriptif: this.getDescriptif(payment.categorie),
            }));
            console.log('Suivi Paiements:', data);
            
            this.isLoading = false;
        } catch (error) {
            console.error('Erreur lors de la récupération des suivis de paiements:', error);
            this.suiviPaiements = [];
            this.isLoading = false;
        }
        },
        debouncedGetSuiviPaiements: debounce(function () {
        this.getFirstSuiviPaiements();
        }, 300),
        getDescriptif(categorie) {
        const cat = this.categories.find(c => c.key === categorie);
        return cat ? cat.label : categorie;
        },
        async filtrer() {
        if (this.texteRecherche === '') {
            this.getSuiviPaiements();
            return;
        }
        try {
            const query = supabase
            .from('payment')
            .select('id, time, montant, ele_id, categorie, infoc!ele_id(nom, prom_ele)')
            .is('annee', null)
            .is('mois', null)
            .eq('infoc.prom_ele', this.selectPromStore.promotion_selected)
            .order('time', { ascending: false });

            if (this.critereRecherche === 'nom') {
            query.ilike('infoc.nom', `%${this.texteRecherche}%`);
            } else if (this.critereRecherche === 'montant') {
            query.eq('montant', parseFloat(this.texteRecherche));
            } else if (this.critereRecherche === 'categorie') {
            query.ilike('categorie', `%${this.texteRecherche}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            this.suiviPaiements = data.map(payment => ({
            ...payment,
            nom: payment.infoc?.nom || '',
            descriptif: this.getDescriptif(payment.categorie),
            }));
        } catch (error) {
            console.error('Erreur lors de la recherche des suivis de paiements:', error);
            this.suiviPaiements = [];
        }
        },
        dataInitialFormMod(item) {
        this.initialValues = {
            ...item,
            categorie: item.categorie,
            time: item.time,
        };
        },
        async modPaiement(data) {
        try {
            const cleanedData = {
            montant: data.montant,
            categorie: data.categorie,
            };

            const { error } = await supabase
            .from('payment')
            .update(cleanedData)
            .eq('id', this.initialValues.id);

            if (error) throw error;

            alert('Paiement modifié avec succès !');
        } catch (error) {
            console.error('Erreur lors de la modification du paiement:', error);
            alert('Erreur lors de la modification du paiement.');
        }
        },
        subscribeToTable() {
        this.realtimeStore.subscribeToTable('payment', 'suiviPaiements', this);
        },
        exportToExcel() {
        const worksheetData = this.suiviPaiements.map(item => {
            const row = {};
            this.columns.forEach(col => {
            row[col.label] = item[col.key] || '';
            });
            return row;
        });
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Suivi Paiements');
        const fileName = 'SuiviPaiements.xlsx';
        XLSX.writeFile(wb, fileName);
        },
    },
    async mounted() {
        this.subscribeToTable();
        await this.debouncedGetSuiviPaiements();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('payment', 'suiviPaiements');
    },
    };
    </script>

    <style scoped>
    .table-container {
    overflow-x: auto;
    }
    </style>