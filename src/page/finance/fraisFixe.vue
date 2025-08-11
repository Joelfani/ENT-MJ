    <template>
    <LoadingComponent v-if="isLoading" dataload="des frais fixes" />
    <div v-else>
        <div class="header-title-table">
        <div>
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

        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="filteredRows">
        <template #actions="{ item }">
            <TableAction 
            :id="item.id" 
            title="ou enregistrer un frais fixe" 
            table-suppr="payment" 
            :notSuppr="true" 
            :view_but_mod="false" 
            :neutre_but="true" 
            label_neutre_but="Modifier" 
            btn_neutre_class="btn-primary" 
            btn_neutre_modal="mod" 
            @btn_neutre_click="dataInitialFormMod(ctg, item.id)" 
            @loadData="loadData"  
            :mini_title="item.nom" 
            :view_but_del="false"
            >
            <template #form_modifier>
                <form class="form" @submit.prevent="modFrais()">
                <div class="form-group">
                    <label for="categorie">Frais fixe</label>
                    <select class="form-control" name="categorie" v-model="ctg">
                    <option v-for="cat in categories" :key="cat.key" :value="cat.key">
                        {{ cat.label }}
                    </option>
                    </select>
                    <label for="montant">Montant</label>
                    <input type="number" class="form-control" name="montant" v-model="montant">
                </div>
                <button type="submit" class="btn btn-primary">
                    Enregistrer / Modifier
                </button>
                <button class="btn btn-light" data-dismiss="modal">
                    Fermer
                </button>
                </form>
                <hr>
                <div class="container-fluid">
                    <div class="row" v-for="(pair, pairIndex) in categoryPairs" :key="pairIndex">
                        <div class="col" v-for="category in pair" :key="category.key">
                            <p><span style="font-weight: bold;"> {{ category.label }} :</span> <span :style="{ color: getPaiement(item.id, category.key)?.montant == null ? 'red':''}">{{ getPaiement(item.id, category.key)?.montant ?? 'Non payé' }}</span></p>
                            
                        </div>
                    </div>
                </div>
                
            </template>
            </TableAction>
        </template>
        </TableComponent>
    </div>
    </template>

    <script>
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
    name: 'FixedFeesTable',
    components: {
        TableComponent,
        LoadingComponent,
        TableAction,
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
        paiements: [],
        categories: [
            { key: 'droit_inscription', label: 'Droit d’inscription' },
            { key: 'carnet_1', label: 'Carnet de correspondance (A1)' },
            { key: 'assurances_1', label: 'Assurances (A1)' },
            { key: 'ecole_parents', label: 'Ecole des parents' },
            { key: 'uniforme_1', label: 'Uniforme de l\'école (1ère tranche)' },
            { key: 'uniforme_2', label: 'Uniforme de l\'école (2ème tranche)' },
            { key: 'uniforme_3', label: 'Uniforme de l\'école (3ème tranche)' },
            { key: 'carnet_2', label: 'Carnet de correspondance (A2)' },
            { key: 'assurances_2', label: 'Assurances (A2)' },
        ],
        columns: [],
        columns2: [
            { key: 'rang', label: 'Matricule', style: 'min-width: 150px' },
            { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' },
            { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
        ],
        label_but_dev_tab: 'Développer',
        tool: 'Développer le tableau',
        initialValues: {},
        idMod: null,
        ctg: 'droit_inscription',
        montant: null,
        idPay: null,
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        filteredRows() {
        return this.eleves.map(eleve => {
            const row = { 
            id: eleve.id, 
            rang: eleve.rang, 
            nom: eleve.nom, 
            filiere: eleve.filiere 
            };
            this.categories.forEach(cat => {
            const key = cat.key;
            const paiement = this.getPaiement(eleve.id, cat.key);
            row[key] = paiement ? paiement.montant : '';
            });
            return row;
        });
        },
        // Cette méthode permet de regrouper les catégories par paires pour l'affichage
        categoryPairs() {
            const pairs = [];
            for (let i = 0; i < this.categories.length; i += 2) {
            pairs.push(this.categories.slice(i, i + 2));
            }
            return pairs;
        }

    },
    watch: {
        'selectPromStore.promotion_selected': {
        handler() {
            this.debouncedecoData();                
        },
        },
        ctg() {
        this.dataInitialFormMod(this.ctg, this.idMod);
        },
    },
    methods: {
        async ecoData() {
        try {
            const { data: eleves, error: elevesError } = await supabase
            .from('infoc')
            .select('*')
            .eq('prom_ele', this.selectPromStore.promotion_selected)
            .order('rang', { ascending: false });
            if (elevesError) throw elevesError;

            const { data: paiements, error: paiementsError } = await supabase
            .from('payment')
            .select('*')
            .order('id', { ascending: false });
            if (paiementsError) throw paiementsError;

            this.eleves = eleves;
            this.paiements = paiements;
            this.updateColumns();
            this.isLoading = false;
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            this.eleves = [];
            this.paiements = [];
            this.isLoading = false;
        }
        },
        debouncedecoData: debounce(function () {
        this.ecoData();
        }, 300),
        updateColumns() {
        const dynamicColumns = this.categories.map(cat => ({
            key: cat.key,
            label: cat.label,
            style: 'min-width: 250px;',
        }));
        this.columns = [
            { key: 'rang', label: 'Matricule', style: 'min-width: 150px' },
            { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px', etat: true },
            { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
            ...dynamicColumns,
        ];
        },
        //Cette methode permet de récupérer le paiement d'un élève pour une catégorie donnée
        getPaiement(eleveId, cat) {
        return this.paiements.find(pay => 
            pay.ele_id === eleveId && 
            pay.categorie === cat &&
            pay.annee === null &&
            pay.mois === null
        ) || null;
        },

        //Cette methode permet de filtrer les élèves en fonction du critère de recherche
        async filtrer() {
        if (this.texteRecherche === '') {
            this.ecoData();
            return;
        }
        try {
            const query = supabase
            .from('infoc')
            .select('*')
            .eq('prom_ele', this.selectPromStore.promotion_selected)
            .order('rang', { ascending: false });
            
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
        async dataInitialFormMod(ctg, id) {
        this.idMod = id;
        try {
            const { data, error } = await supabase
            .from('payment')
            .select('*')
            .eq('ele_id', id)
            .eq('categorie', ctg)
            .is('annee', null)
            .is('mois', null)
            .maybeSingle();
            this.montant = data ? data.montant : 0;
            this.idPay = data ? data.id : null;
            if (error) throw error;
        } catch (error) {
            if (error.details !== 'The result contains 0 rows') {
            console.error('Erreur lors de la récupération des données:', error);
            alert('Erreur lors de la récupération des données.');
            }
        }
        },
        async modFrais() {
        //update payment
        if (this.idPay) {
            try {
            const { error } = await supabase
                .from('payment')
                .update({ montant: this.montant == '' ? null : this.montant})
                .eq('id', this.idPay);
            if (error) throw error;
            try {
                const {error} = await supabase
                .from('pay_track')
                .insert({
                    id_pay: this.idPay,
                    ele_id: this.idMod,
                    descriptif: this.ctg,
                    montant: this.montant == '' ? null : this.montant,
                    user: this.userStore.id
                })
                if (error) throw error;
            } catch (error) {
                console.error('Erreur lors de la récupération des données après modification:', error);
            }
            alert('Frais modifié avec succès !');
            } catch (error) {
            console.error('Erreur lors de la modification du frais:', error);
            alert('Erreur lors de la modification du frais.');
            }
        } 
        //insert payment
        else {
            try {
                const { data, error } = await supabase
                .from('payment')
                .insert({
                    ele_id: this.idMod,
                    categorie: this.ctg,
                    annee: null,
                    mois: null,
                    montant: this.montant == '' ? null : this.montant,
                })
                .select('id')
                .single();

                if (error) throw error;

                this.idPay = data.id;

                await supabase
                .from('pay_track')
                .insert({
                    id_pay: this.idPay,
                    ele_id: this.idMod,
                    descriptif: this.ctg,
                    montant: this.montant == '' ? null : this.montant,
                    user: this.userStore.id
                });

                alert('Frais enregistré avec succès !');
                this.dataInitialFormMod(this.ctg, this.idMod);

            } catch (error) {
                console.error("Erreur lors de l'enregistrement du frais:", error);
                alert("Erreur lors de l'enregistrement du frais.");
            }
        }
        },
        subscribeToTable() {
        this.realtimeStore.subscribeToTable('payment', 'paiements', this);
        },
        exportToExcel() {
        const worksheetData = this.filteredRows.map(item => {
            const row = {};
            this.columns.forEach(col => {
            row[col.label] = item[col.key] || '';
            });
            return row;
        });
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Frais Fixes');
        XLSX.writeFile(wb, 'Frais_Fixes.xlsx');
        },
        loadData() {
        this.ecoData();
        },
    },
    async mounted() {
        this.subscribeToTable();
        await this.debouncedecoData();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('payment', 'paiements');
    },
    };
    </script>

    <style scoped>
    .table-container {
    overflow-x: auto;
    }
    </style>