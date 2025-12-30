<template>
    <div class="dashboard-container">
        <div class="max-w-7xl">
            <!-- En-tête -->
            <div class="header">
                <h1 class="main-title">PROMOTION {{ prom.name }}</h1>
                <div class="title-underline"></div>
            </div>

            <!-- Cartes statistiques principales -->
            <div class="stats-grid">
                <!-- Total candidats -->
                <div class="stat-card stat-card-white">
                    <div class="stat-content">
                        <div>
                            <p class="stat-label">Nombre d'élève</p>
                            <p class="stat-value">{{ stats.totalCandidats }}</p>
                        </div>
                        <div class="stat-icon stat-icon-blue">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Garçons -->
                <div class="stat-card stat-card-blue">
                    <div class="stat-content">
                        <div>
                            <p class="stat-label-white">Nombre des garçons</p>
                            <p class="stat-value-white">{{ stats.nombreGarcons }}</p>
                            <p class="stat-percentage">{{ stats.pourcentageGarcons }} %</p>
                        </div>
                        <div class="stat-icon stat-icon-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Filles -->
                <div class="stat-card stat-card-red">
                    <div class="stat-content">
                        <div>
                            <p class="stat-label-white">Nombre des filles</p>
                            <p class="stat-value-white">{{ stats.nombreFilles }}</p>
                            <p class="stat-percentage">{{ stats.pourcentageFilles }} %</p>
                        </div>
                        <div class="stat-icon stat-icon-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Graphiques -->
            <div class="charts-grid" v-if="chartsReady">
                <!-- Répartition par genre -->
                <div class="chart-card">
                    <h3 class="chart-title">Effectif désagrégé Garçon/Fille par filière</h3>
                    
                    <!-- Sélecteur de filière -->
                    <div class="select-container">
                        <label class="select-label">Sélectionner une filière</label>
                        <select v-model="selectedFiliere" class="select-input">
                            <option v-for="filiere in filieres" :key="filiere" :value="filiere">
                                {{ filiere }}
                            </option>
                        </select>
                    </div>

                    <p class="filiere-info">
                        Filière: <span class="font-bold">{{ selectedFiliere }}</span>
                    </p>
                    <p class="total-info">
                        Total: {{ currentFiliereData.total }}
                    </p>

                    <div class="chart-container">
                        <canvas ref="genderChart"></canvas>
                    </div>
                </div>

                <!-- Variation d'âge -->
                <div class="chart-card">
                    <h3 class="chart-title">
                        <svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Effectif selon l'âge
                    </h3>
                    <p class="chart-subtitle">Axes des X: Âge | Axes des Y: Nombre d'élève</p>
                    
                    <div class="chart-container">
                        <canvas ref="ageChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Nouveaux graphiques: Niveau et Diplôme -->
            <div v-if="chartsReady" class="charts-grid2">
                <!-- Niveau d'étude -->
                <div class="chart-card">
                    <h3 class="chart-title">
                        <svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Niveau d'étude à l'entrée
                    </h3>
                    <p class="chart-subtitle">Axes des X: Niveau | Axes des Y: Nombre d'élève</p>
                    <div class="chart-container">
                        <canvas ref="nivChart"></canvas>
                    </div>
                </div>

                <!-- Diplôme -->
                <div class="chart-card">
                    <h3 class="chart-title">
                        <svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Répartition par diplôme
                    </h3>
                    <p class="chart-subtitle">Distribution des diplômes obtenus</p>
                    <div class="chart-container">
                        <canvas ref="diplomeChart"></canvas>
                    </div>
                </div>
            </div>
            <br>
            <div v-if="chartsReady" class="charts-grid2">

                <!-- Situation des élèves -->
                <div class="chart-card">
                    <h3 class="chart-title">Situation des élèves</h3>
                    <div class="chart-container">
                        <canvas ref="etatChart"></canvas>
                    </div>
                </div>

                <!-- Motifs renvoi -->
                <div class="chart-card">
                    <h3 class="chart-title">Motifs de renvoi</h3>
                    <div class="chart-container">
                        <canvas ref="motifChart"></canvas>
                    </div>
                </div>

                <!-- Motifs abandon -->
                <div class="chart-card">
                    <h3 class="chart-title">Motifs d'abandon</h3>
                    <div class="chart-container">
                        <canvas ref="motifAbandonChart"></canvas>
                    </div>
                </div>
                
                <!-- Situation hébergement -->
                <div class="chart-card">
                    <h3 class="chart-title">Situation d'hébergement</h3>
                    <div class="chart-container">
                        <canvas ref="hebergementChart"></canvas>
                    </div>
                </div>
                <!-- Situation matrimoniale -->
                <div class="chart-card">
                    <h3 class="chart-title">Situation matrimoniale</h3>
                    <div class="chart-container">
                        <canvas ref="situationChart"></canvas>
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card stat-card-white">
                        <div class="stat-content">
                            <div>
                                <p class="stat-label">Participation à l’examen final</p>
                                <p class="stat-value">{{ stats.participationExam.total }}</p>
                                <p class="text-sm text-gray-500">
                                    {{ stats.participationExam.pourcentage }} %
                                </p>
                                <p class="text-sm text-gray-500">
                                    Garçon: {{ stats.participationExam.garcons }} |
                                    Fille: {{ stats.participationExam.filles }}
                                </p>
                            </div>
                            <div class="stat-icon stat-icon-blue">
                                🎓
                            </div>
                        </div>
                    </div>
                        <br>
                    <div class="stat-card stat-card-white">
                        <div class="stat-content">
                            <div>
                                <p class="stat-label">Réussite à l’examen final</p>
                                <p class="stat-value">{{ stats.reussiteExam.total }}</p>
                                <p class="text-sm text-gray-500">
                                    {{ stats.reussiteExam.pourcentage }} % 
                                </p>
                                <p class="text-sm text-gray-500">
                                    Garçon: {{ stats.reussiteExam.garcons }} |
                                    Fille: {{ stats.reussiteExam.filles }}
                                </p>
                            </div>
                            <div class="stat-icon stat-icon-blue">
                                ✅
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <br>
            <div v-if="chartsReady" class="chart-card">
                <h3 class="chart-title">Variation des absences et retards par filière</h3>

                <!-- Sélecteur de filière pour absences/retards -->
                <div class="select-container">
                    <label class="select-label">Sélectionner une filière</label>
                    <select v-model="selectedFiliereAbsence" class="select-input">
                        <option v-for="filiere in filieres" :key="filiere" :value="filiere">
                            {{ filiere }}
                        </option>
                    </select>
                </div>

                <p class="filiere-info">
                    Filière: <span class="font-bold">{{ selectedFiliereAbsence }}</span>
                </p>

                <div class="charts-grid2">
                    <!-- Absence -->
                    <div>
                        <h4 class="text-center font-bold mb-2">Absences</h4>
                        <div class="chart-container">
                            <canvas ref="absenceChart"></canvas>
                        </div>
                    </div>

                    <!-- Retard -->
                    <div>
                        <h4 class="text-center font-bold mb-2">Retards</h4>
                        <div class="chart-container">
                            <canvas ref="retardChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            <div v-if="chartsReady" class="charts-grid2">
                <div class="stat-card stat-card-white">
                    <div class="stat-content">
                        <div>
                            <p class="stat-label">Participation DELF / DALF</p>
                            <p class="stat-value">{{ stats.participationDelf.total }}</p>
                            <p class="text-sm text-gray-500">
                                {{ stats.participationDelf.pourcentage }} %
                            </p>
                            <p class="text-sm text-gray-500">
                                G: {{ stats.participationDelf.garcons }} |
                                F: {{ stats.participationDelf.filles }}
                            </p>
                        </div>
                        <div class="stat-icon stat-icon-blue">
                            🇫🇷
                        </div>
                    </div>
                </div>
                <div class="stat-card stat-card-white">
                    <div class="stat-content">
                        <div>
                            <p class="stat-label">Réussite DELF / DALF</p>
                            <p class="stat-value">{{ stats.reussiteDelf.total }}</p>
                            <p class="text-sm text-gray-500">
                                {{ stats.reussiteDelf.pourcentage }} %
                            </p>
                            <p class="text-sm text-gray-500">
                                G: {{ stats.reussiteDelf.garcons }} |
                                F: {{ stats.reussiteDelf.filles }}
                            </p>
                        </div>
                        <div class="stat-icon stat-icon-green">
                            🏅
                        </div>
                    </div>
                </div>

            </div>
            <br>
            <div v-if="chartsReady" class="chart-card">
                <h3 class="chart-title">
                    <svg class="inline-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lieux de stage des élèves
                </h3>

                <p class="chart-subtitle">
                    Entreprises ayant accueilli des stagiaires
                </p>

                <div class="chart-container">
                    <canvas ref="stageChart"></canvas>
                </div>
            </div>

            <!-- Aucun DATA -->
            <div v-else-if="!isLoadingData && stats.totalCandidats === 0" class="loader-container">
                <p class="loader-text">Aucune donnée disponible pour cette promotion.</p>
            </div>
            <!-- Loader pendant le chargement -->
            <div v-else class="loader-container">
                <div class="loader"></div>
                <p class="loader-text">Chargement des statistiques...</p>
            </div>

            
        </div>
    </div>
</template>

<script>
import { selectPromStore } from '@/store/selectProm';
import { mapStores } from 'pinia';
import { supabase } from '@/supabase';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
    name: 'CandidatTdb',
    data() {
        return {
            prom: { annee: ''},
            selectedFiliere: '',
            selectedFiliereAbsence: '',
            filieres: [],
            stats: {
                totalCandidats: 0,
                nombreGarcons: 0,
                nombreFilles: 0,
                pourcentageGarcons: 0,
                pourcentageFilles: 0,


                //exam
                participationExam: {
                    total: 0,
                    garcons: 0,
                    filles: 0,
                    pourcentage: 0
                },
                reussiteExam: {
                    total: 0,
                    garcons: 0,
                    filles: 0,
                    pourcentage: 0
                },

                //DELF
                participationDelf: {
                    total: 0,
                    garcons: 0,
                    filles: 0,
                    pourcentage: 0
                },
                reussiteDelf: {
                    total: 0,
                    garcons: 0,
                    filles: 0,
                    pourcentage: 0
                }
            },
            variationAge: [],
            variationNiv: [],
            variationDiplome: [],
            repartitionParFiliere: {},
            variationEtat: [],
            variationMotif: [],
            variationMotifAbandon: [],
            variationHebergement: [],
            variationSituation: [],
            variationStage: [],

            absenceRetardParFiliere: {},
            genderChartInstance: null,
            ageChartInstance: null,
            nivChartInstance: null,
            diplomeChartInstance: null,
            chartsReady: false,
            isLoadingData: false,
            etatChartInstance: null,
            motifChartInstance: null,
            motifAbandonChartInstance: null,
            hebergementChartInstance: null,
            situationChartInstance: null,
            absenceChartInstance: null,
            retardChartInstance: null,
            stageChartInstance: null,
        }
    },
    computed: {
        ...mapStores(selectPromStore),
        currentFiliereData() {
            return this.repartitionParFiliere[this.selectedFiliere] || { garcons: 0, filles: 0, total: 0 };
        },
        currentAbsenceRetardData() {
            return this.absenceRetardParFiliere[this.selectedFiliereAbsence] || {
                Absence: { garcons: 0, filles: 0 },
                Retard: { garcons: 0, filles: 0 }
            };
        }

    },
    watch: {
        'selectPromStore.promotion_selected': {
            handler(newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    this.recoveryProm();
                }
            },
            immediate: true,
        },
        selectedFiliere(newVal, oldVal) {
            if (newVal && newVal !== oldVal && this.genderChartInstance) {
                this.updateGenderChart();
            }
        },
        selectedFiliereAbsence(newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                if (this.absenceChartInstance && this.retardChartInstance) {
                    this.absenceChartInstance.data.datasets[0].data = [
                        this.currentAbsenceRetardData.Absence.filles,
                        this.currentAbsenceRetardData.Absence.garcons
                    ];

                    this.retardChartInstance.data.datasets[0].data = [
                        this.currentAbsenceRetardData.Retard.filles,
                        this.currentAbsenceRetardData.Retard.garcons
                    ];

                    this.absenceChartInstance.update();
                    this.retardChartInstance.update();
                }
            }
        }

        
    },
    methods: {
        async recoveryProm() {
            if (this.isLoadingData) return;
            
            this.isLoadingData = true;
            this.chartsReady = false;
            
            // Détruire les graphiques existants
            this.destroyCharts();
            
            try {
                const { data, error } = await supabase
                    .from('mjg_promotion')
                    .select('*')
                    .eq('id', this.selectPromStore.promotion_selected)
                    .single();
                
                if (error) throw error;
                this.prom = data;
                
                // Récupérer les statistiques des candidats
                await this.loadCandidatsStats();
                
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                this.prom = { name: '' };
            } finally {
                this.isLoadingData = false;
            }
        },
        
        async loadCandidatsStats() {
            try {
                // Récupérer tous les candidats de la promotion
                const { data: candidats, error } = await supabase
                    .from('mgj_infoc')
                    .select('*')
                    .eq('prom_ele', this.selectPromStore.promotion_selected);
                
                if (error) throw error;
                
                if (!candidats || candidats.length === 0) {
                    console.warn('Aucun candidat trouvé pour cette promotion');

                    this.resetStats();
                    return;
                }
                
                // Calculer les statistiques
                this.calculateStats(candidats);
                this.calculateAgeDistribution(candidats);
                this.calculateNivDistribution(candidats);
                this.calculateDiplomeDistribution(candidats);
                this.calculateFiliereDistribution(candidats);
                this.calculateEtatDistribution(candidats);
                this.calculateMotifDistribution(candidats);
                this.calculateMotifAbandonDistribution(candidats);
                this.calculateHebergementDistribution(candidats);
                this.calculateSituationDistribution(candidats);
                await this.loadAbsenceRetardStats();
                this.calculateParticipationExam(candidats);
                this.calculateParticipationDelf(candidats);
                this.calculateStageDistribution(candidats);

                // Créer les graphiques après un court délai
                await this.$nextTick();
                setTimeout(() => {
                    this.chartsReady = true;
                    this.$nextTick(() => {
                        this.createGenderChart();
                        this.createAgeChart();
                        this.createNivChart();
                        this.createDiplomeChart();
                        this.createEtatChart();
                        this.createMotifChart();
                        this.createMotifAbandonChart();
                        this.createHebergementChart();
                        this.createSituationChart();
                        this.createAbsenceChart();
                        this.createRetardChart();
                        this.createStageChart();
                    });
                }, 100);
                
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
                this.resetStats();
            }
        },
        
        async loadAbsenceRetardStats() {
            try {
                const { data, error } = await supabase
                    .from('mjg_abs')
                    .select('filiere, genre, prom_ele, ctg')
                    .eq('prom_ele', this.selectPromStore.promotion_selected);

                        if (error) throw error;

                        this.calculateAbsenceRetardDistribution(data);

                    } catch (error) {
                        console.error('Erreur chargement absences / retards:', error);
                    }
        },
        resetStats() {
            this.stats = {
                totalCandidats: 0,
                nombreGarcons: 0,
                nombreFilles: 0,
                pourcentageGarcons: 0,
                pourcentageFilles: 0
            };
            this.variationAge = [];
            this.variationNiv = [];
            this.variationDiplome = [];
            this.repartitionParFiliere = {};
            this.filieres = [];
            this.selectedFiliere = '';
            this.selectedFiliereAbsence = '';
            this.chartsReady = false;
        },
        //calcul des données
        calculateStats(candidats) {
            this.stats.totalCandidats = candidats.length;
            this.stats.nombreGarcons = candidats.filter(c => c.genre === 'M').length;
            this.stats.nombreFilles = candidats.filter(c => c.genre === 'F').length;
            
            if (this.stats.totalCandidats > 0) {
                this.stats.pourcentageGarcons = Math.round((this.stats.nombreGarcons / this.stats.totalCandidats) * 100);
                this.stats.pourcentageFilles = Math.round((this.stats.nombreFilles / this.stats.totalCandidats) * 100);
            } else {
                this.stats.pourcentageGarcons = 0;
                this.stats.pourcentageFilles = 0;
            }
        },
        
        calculateAgeDistribution(candidats) {
            const ageMap = {};
            candidats.forEach(c => {
                if (c.age) {
                    const age = parseInt(c.age);
                    if (!isNaN(age)) {
                        ageMap[age] = (ageMap[age] || 0) + 1;
                    }
                }
            });
            
            this.variationAge = Object.keys(ageMap)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(age => ({ age: parseInt(age), nombre: ageMap[age] }));
        },
        
        calculateNivDistribution(candidats) {
            // Initialiser avec tous les niveaux possibles
            const niveauxOrdre = ["4ème", "3ème", "2nde", "1ère", "Terminale","BAC+1","BAC+2","Supérieur à BAC+2"];
            const nivMap = {};
            
            // Initialiser tous les niveaux à 0
            niveauxOrdre.forEach(niv => {
                nivMap[niv] = 0;
            });
            
            // Compter les candidats par niveau
            candidats.forEach(c => {
                const niv = c.niveau; // Ajustez selon le nom exact de votre colonne
                if (niv && Object.hasOwn(nivMap, niv)) {
                    nivMap[niv]++;
                }
            });
            
            // Créer le tableau dans l'ordre correct
            this.variationNiv = niveauxOrdre.map(niv => ({
                niveau: niv,
                nombre: nivMap[niv]
            }));
        },
        
        calculateDiplomeDistribution(candidats) {
            // Initialiser avec tous les diplômes possibles
            const diplomesOrdre = ["AUCUN", "CEPE", "BEPC", "BACC", "AUTRE"];
            const diplomeMap = {};
            
            // Initialiser tous les diplômes à 0
            diplomesOrdre.forEach(dip => {
                diplomeMap[dip] = 0;
            });
            
            // Compter les candidats par diplôme
            candidats.forEach(c => {
                const dip = c.diplome ? c.diplome.toUpperCase() : 'AUCUN'; // Normaliser en majuscules
                if (Object.hasOwn(diplomeMap, dip)) {
                    diplomeMap[dip]++;
                } else {
                    // Si le diplôme ne correspond à aucun des attendus, le mettre dans AUTRE
                    diplomeMap['AUTRE']++;
                }
            });
            
            // Créer le tableau dans l'ordre correct
            this.variationDiplome = diplomesOrdre.map(dip => ({
                diplome: dip,
                nombre: diplomeMap[dip]
            }));
            
            console.log('Distribution diplôme:', this.variationDiplome);
        },
        
        calculateFiliereDistribution(candidats) {
            this.repartitionParFiliere = {};
            
            candidats.forEach(c => {
                const filiere = c.filiere || 'Non spécifié';
                
                if (!this.repartitionParFiliere[filiere]) {
                    this.repartitionParFiliere[filiere] = { garcons: 0, filles: 0, total: 0 };
                }
                
                if (c.genre === 'M') {
                    this.repartitionParFiliere[filiere].garcons++;
                } else {
                    this.repartitionParFiliere[filiere].filles++;
                }
                this.repartitionParFiliere[filiere].total++;
            });
            
            this.filieres = Object.keys(this.repartitionParFiliere);
            
            if (this.filieres.length > 0) {
                this.selectedFiliere = this.filieres[0];
                this.selectedFiliereAbsence = this.filieres[0];
            } else {
                this.selectedFiliere = '';
                this.selectedFiliereAbsence = '';
            }
        },
        calculateEtatDistribution(candidats) {
            const etats = ['En cours', 'Diplômé', 'Abandon', 'Exclu'];
            const map = {};

            etats.forEach(e => map[e] = 0);

            candidats.forEach(c => {
                if (c.etat_ele && Object.hasOwn(map, c.etat_ele)) {
                    map[c.etat_ele]++;
                }
            });

            this.variationEtat = etats.map(e => ({
                etat: e,
                nombre: map[e]
            }));
        },

        calculateMotifDistribution(candidats) {
            const motifs = [
                'absence / retard fréquente',
                'comportement inapproprié',
                'faute grave',
                'autre'
            ];

            const map = {};
            motifs.forEach(m => map[m] = 0);

            candidats.forEach(c => {
                if (c.motif_etat_ele) {
                    const motif = c.motif_etat_ele.toLowerCase();
                    motifs.forEach(m => {
                        if (motif === m.toLowerCase()) {
                            map[m]++;
                        }
                    });
                }
            });

            this.variationMotif = motifs.map(m => ({
                motif: m,
                nombre: map[m]
            }));
        },
        calculateMotifAbandonDistribution(candidats) {
            const motifs = [
                'raison familiale',
                'grossesse',
                'raison financière',
                'déménagement',
                'pas motivé à continuer',
                'maladie',
                'autre'
            ];

            const map = {};
            motifs.forEach(m => map[m] = 0);

            candidats.forEach(c => {
                if (c.motif_abandon) {
                    const motif = c.motif_abandon.toLowerCase();
                    motifs.forEach(m => {
                        if (motif === m.toLowerCase()) {
                            map[m]++;
                        }
                    });
                }
            });

            this.variationMotifAbandon = motifs.map(m => ({
                motif: m,
                nombre: map[m]
            }));
        },
        calculateHebergementDistribution(candidats) {
            const situations = [
                'Habite seul.e',
                'Habite avec parents',
                'Habite avec famille',
                'Habite avec connaissance',
                'Vit en concubinage'
            ];

            const map = {};
            situations.forEach(s => map[s] = 0);

            candidats.forEach(c => {
                if (c.situation && Object.hasOwn(map, c.situation)) {
                    map[c.situation]++;
                }
            });

            this.variationHebergement = situations.map(s => ({
                situation: s,
                nombre: map[s]
            }));
        },

        calculateSituationDistribution(candidats) {
            const situations = [
                'célibataire',
                'mère/père célibataire',
                'Marié.e sans enfant',
                'Marié.e avec enfant(s)',
                'Divorcé.e',
                'Veuf.ve'
            ];

            const map = {};
            situations.forEach(s => map[s] = 0);

            candidats.forEach(c => {
                if (c.pres && Object.hasOwn(map, c.pres)) {
                    map[c.pres]++;
                }
            });

            this.variationSituation = situations.map(s => ({
                situation: s,
                nombre: map[s]
            }));
        },

        calculateAbsenceRetardDistribution(rows) {
            this.absenceRetardParFiliere = {};

            rows.forEach(r => {
                const filiere = r.filiere || 'Non spécifié';

                if (!this.absenceRetardParFiliere[filiere]) {
                    this.absenceRetardParFiliere[filiere] = {
                        Absence: { garcons: 0, filles: 0 },
                        Retard: { garcons: 0, filles: 0 }
                    };
                }

                if (r.ctg === 'Absence') {
                    r.genre === 'M'
                        ? this.absenceRetardParFiliere[filiere].Absence.garcons++
                        : this.absenceRetardParFiliere[filiere].Absence.filles++;
                }

                if (r.ctg === 'Retard') {
                    r.genre === 'M'
                        ? this.absenceRetardParFiliere[filiere].Retard.garcons++
                        : this.absenceRetardParFiliere[filiere].Retard.filles++;
                }
            });
        },

        calculateParticipationExam(candidats) {
            const total = candidats.length;

            const participants = candidats.filter(
                c => c.participationExam === 'oui'
            );

            const garcons = participants.filter(c => c.genre === 'M').length;
            const filles = participants.filter(c => c.genre === 'F').length;

            const nombre = participants.length;

            this.stats.participationExam = {
                total: nombre,
                garcons,
                filles,
                pourcentage: total > 0
                    ? Math.round((nombre / total) * 100)
                    : 0
            };
            this.calculateReussiteExam(participants);
        },

        calculateReussiteExam(candidats) {
            const total = candidats.length;

            const reussis = candidats.filter(
                c => c.reussite === 'Réussite'
            );

            const garcons = reussis.filter(c => c.genre === 'M').length;
            const filles = reussis.filter(c => c.genre === 'F').length;

            const nombre = reussis.length;

            this.stats.reussiteExam = {
                total: nombre,
                garcons,
                filles,
                pourcentage: total > 0
                    ? Math.round((nombre / total) * 100)
                    : 0
            };
        },

        calculateParticipationDelf(candidats) {
            const total = candidats.length;

            const participants = candidats.filter(
                c => c.examDelf === 'oui'
            );

            const garcons = participants.filter(c => c.genre === 'M').length;
            const filles = participants.filter(c => c.genre === 'F').length;

            const nombre = participants.length;

            this.stats.participationDelf = {
                total: nombre,
                garcons,
                filles,
                pourcentage: total > 0
                    ? Math.round((nombre / total) * 100)
                    : 0
            };
            this.calculateReussiteDelf(participants);
        },
        calculateReussiteDelf(candidats) {
            const total = candidats.length;

            const reussis = candidats.filter(
                c => c.reussiteDelf === 'Réussite'
            );

            const garcons = reussis.filter(c => c.genre === 'M').length;
            const filles = reussis.filter(c => c.genre === 'F').length;

            const nombre = reussis.length;

            this.stats.reussiteDelf = {
                total: nombre,
                garcons,
                filles,
                pourcentage: total > 0
                    ? Math.round((nombre / total) * 100)
                    : 0
            };
        },

        calculateStageDistribution(candidats) {
            const stageMap = {}; 
            // structure :
            // {
            //   "Entreprise A": Set(ele_id),
            //   "Entreprise B": Set(ele_id)
            // }

            candidats.forEach(c => {
                const eleId = c.id; // ou c.ele_id selon ta table

                const stages = [
                    c.stage1,
                    c.stage2,
                    c.stage3,
                    c.stage4,
                    c.stage5,
                    c.stage6
                ];

                stages.forEach(stage => {
                    if (stage && stage.trim() !== '') {
                        const entreprise = stage.trim();

                        if (!stageMap[entreprise]) {
                            stageMap[entreprise] = new Set();
                        }

                        stageMap[entreprise].add(eleId);
                    }
                });
            });

            this.variationStage = Object.keys(stageMap).map(entreprise => ({
                entreprise,
                nombre: stageMap[entreprise].size
            }));
        },

        //gestion des chart
        createGenderChart() {
            if (!this.$refs.genderChart) return;
            
            if (this.genderChartInstance) {
                this.genderChartInstance.destroy();
                this.genderChartInstance = null;
            }
            
            if (!this.currentFiliereData || this.currentFiliereData.total === 0) {
                return;
            }
            
            try {
                const ctx = this.$refs.genderChart.getContext('2d');
                this.genderChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Filles', 'Garçons'],
                        datasets: [{
                            data: [this.currentFiliereData.filles, this.currentFiliereData.garcons],
                            backgroundColor: ['#ef4444', '#3b82f6'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    font: { size: 13 },
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                padding: 12
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la création du graphique genre:', error);
            }
        },
        
        updateGenderChart() {
            if (!this.genderChartInstance || !this.currentFiliereData) return;
            
            try {
                this.genderChartInstance.data.datasets[0].data = [
                    this.currentFiliereData.filles,
                    this.currentFiliereData.garcons
                ];
                this.genderChartInstance.update('none');
            } catch (error) {
                console.error('Erreur lors de la mise à jour du graphique genre:', error);
                this.createGenderChart();
            }
        },
        
        createAgeChart() {
            if (!this.$refs.ageChart) return;
            
            if (this.ageChartInstance) {
                this.ageChartInstance.destroy();
                this.ageChartInstance = null;
            }
            
            if (!this.variationAge || this.variationAge.length === 0) {
                return;
            }
            
            try {
                const ctx = this.$refs.ageChart.getContext('2d');
                this.ageChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: this.variationAge.map(d => d.age),
                        datasets: [{
                            label: "Nombre d'élèves",
                            data: this.variationAge.map(d => d.nombre),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                padding: 12
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                                ticks: { font: { size: 11 }, stepSize: 2 }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 11 } }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la création du graphique âge:', error);
            }
        },
        
        createNivChart() {
            if (!this.$refs.nivChart) return;
            
            if (this.nivChartInstance) {
                this.nivChartInstance.destroy();
                this.nivChartInstance = null;
            }
            
            if (!this.variationNiv || this.variationNiv.length === 0) {
                return;
            }
            
            try {
                const ctx = this.$refs.nivChart.getContext('2d');
                this.nivChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.variationNiv.map(d => d.niveau),
                        datasets: [{
                            label: "Nombre d'élèves",
                            data: this.variationNiv.map(d => d.nombre),
                            backgroundColor: '#8b5cf6',
                            borderColor: '#7c3aed',
                            borderWidth: 1,
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                padding: 12
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                                ticks: { 
                                    font: { size: 11 }, 
                                    stepSize: 1,
                                    precision: 0
                                }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 11 } }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la création du graphique niveau:', error);
            }
        },
        
        createDiplomeChart() {
            if (!this.$refs.diplomeChart) return;
            
            if (this.diplomeChartInstance) {
                this.diplomeChartInstance.destroy();
                this.diplomeChartInstance = null;
            }
            
            if (!this.variationDiplome || this.variationDiplome.length === 0) {
                return;
            }
            
            try {
                const ctx = this.$refs.diplomeChart.getContext('2d');
                const colors = ['#94a3b8', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
                
                this.diplomeChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: this.variationDiplome.map(d => d.diplome),
                        datasets: [{
                            data: this.variationDiplome.map(d => d.nombre),
                            backgroundColor: colors,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 15,
                                    font: { size: 12 },
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                padding: 12,
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la création du graphique diplôme:', error);
            }
        },
        
        createEtatChart() {
            if (!this.$refs.etatChart) return;
            const ctx = this.$refs.etatChart.getContext('2d');

            this.etatChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: this.variationEtat.map(e => e.etat),
                    datasets: [{
                        data: this.variationEtat.map(e => e.nombre),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        createMotifChart() {
            if (!this.$refs.motifChart) return;
            const ctx = this.$refs.motifChart.getContext('2d');

            this.motifChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.variationMotif.map(m => m.motif),
                    datasets: [{
                        data: this.variationMotif.map(m => m.nombre),
                        backgroundColor: '#6366f1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                precision: 0
                            }
                        }
                    }
                }
            });
        },
        createMotifAbandonChart() {
            if (!this.$refs.motifAbandonChart) return;
            const ctx = this.$refs.motifAbandonChart.getContext('2d');

            this.motifAbandonChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.variationMotifAbandon.map(m => m.motif),
                    datasets: [{
                        data: this.variationMotifAbandon.map(m => m.nombre),
                        backgroundColor: '#6366f1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                precision: 0
                            }
                        }
                    }
                }
            });
        },
        createHebergementChart() {
            if (!this.$refs.hebergementChart) return;
            const ctx = this.$refs.hebergementChart.getContext('2d');

            this.hebergementChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: this.variationHebergement.map(h => h.situation),
                    datasets: [{
                        data: this.variationHebergement.map(h => h.nombre),
                        backgroundColor: ['#0ea5e9', '#22c55e', '#a855f7', '#f97316', '#ef4444']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        createSituationChart() {
            if (!this.$refs.situationChart) return;
            const ctx = this.$refs.situationChart.getContext('2d');

            this.situationChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: this.variationSituation.map(s => s.situation),
                    datasets: [{
                        data: this.variationSituation.map(s => s.nombre),
                        backgroundColor: ['#0ea5e9', '#22c55e', '#a855f7', '#f97316', '#ef4444','#eee']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        createAbsenceChart() {
            if (!this.$refs.absenceChart) return;
            const ctx = this.$refs.absenceChart.getContext('2d');

            this.absenceChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Filles', 'Garçons'],
                    datasets: [{
                        data: [
                            this.currentAbsenceRetardData.Absence.filles,
                            this.currentAbsenceRetardData.Absence.garcons
                        ],
                        backgroundColor: ['#ef4444', '#3b82f6']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        createRetardChart() {
            if (!this.$refs.retardChart) return;
            const ctx = this.$refs.retardChart.getContext('2d');

            this.retardChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Filles', 'Garçons'],
                    datasets: [{
                        data: [
                            this.currentAbsenceRetardData.Retard.filles,
                            this.currentAbsenceRetardData.Retard.garcons
                        ],
                        backgroundColor: ['#f59e0b', '#3b82f6']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        },

        createStageChart() {
            if (!this.$refs.stageChart || this.variationStage.length === 0) return;

            if (this.stageChartInstance) {
                this.stageChartInstance.destroy();
            }

            const ctx = this.$refs.stageChart.getContext('2d');

            this.stageChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.variationStage.map(s => s.entreprise),
                    datasets: [{
                        label: "Nombre d'élèves en stage",
                        data: this.variationStage.map(s => s.nombre),
                        backgroundColor: '#0ea5e9',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        },
                        x: {
                            ticks: {
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        },

        destroyCharts() {
            const charts = [
                'genderChartInstance',
                'ageChartInstance',
                'nivChartInstance',
                'diplomeChartInstance',
                'etatChartInstance',
                'motifChartInstance',
                'hebergementChartInstance',
                'situationChartInstance',
                'absenceChartInstance',
                'retardChartInstance',
                'stageChartInstance'
            ];
            
            charts.forEach(chartName => {
                if (this[chartName]) {
                    this[chartName].destroy();
                    this[chartName] = null;
                }
            });
        }
    },
    
    beforeUnmount() {
        this.destroyCharts();
    }
}
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.dashboard-container {
    min-height: 100vh;
    background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
    padding: 24px;
}

.max-w-7xl {
    max-width: 1280px;
    margin: 0 auto;
}

.header {
    text-align: center;
    margin-bottom: 32px;
}

.main-title {
    font-size: 2rem;
    font-weight: bold;
    color: #374151;
    margin-bottom: 8px;
}

.title-underline {
    height: 4px;
    width: 128px;
    background-color: #3b82f6;
    margin: 0 auto;
    border-radius: 9999px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.stat-card {
    border-radius: 16px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    transition: box-shadow 0.3s;
}

.stat-card:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-card-white {
    background-color: white;
}

.stat-card-blue {
    background: linear-gradient(to bottom right, #3b82f6, #2563eb);
    color: white;
}

.stat-card-red {
    background: linear-gradient(to bottom right, #ef4444, #dc2626);
    color: white;
}

.stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.stat-label {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 4px;
}

.stat-label-white {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 3rem;
    font-weight: bold;
    color: #1f2937;
}

.stat-value-white {
    font-size: 3rem;
    font-weight: bold;
    color: white;
    margin-bottom: 4px;
}

.stat-percentage {
    font-size: 1.5rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
}

.stat-icon {
    padding: 16px;
    border-radius: 9999px;
}

.stat-icon-blue {
    background-color: #dbeafe;
    color: #2563eb;
}

.stat-icon-white {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
}

.stat-icon svg {
    width: 32px;
    height: 32px;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
}

.charts-grid2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 24px;
}

.chart-card {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    transition: box-shadow 0.3s;
}

.chart-card:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.chart-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #374151;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.inline-icon {
    width: 24px;
    height: 24px;
    color: #3b82f6;
}

.chart-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 24px;
}

.select-container {
    margin-bottom: 24px;
}

.select-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 8px;
}

.select-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 500;
    color: #374151;
    background-color: white;
    transition: border-color 0.2s;
    cursor: pointer;
}

.select-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.filiere-info {
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 16px;
}

.font-bold {
    font-weight: bold;
    color: #1f2937;
}

.total-info {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 24px;
}

.chart-container {
    height: 320px;
    position: relative;
}

.text-center {
    text-align: center;
}

.mb-2 {
    margin-bottom: 0.5rem;
}

/* Loader */
.loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
}

.loader {
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loader-text {
    margin-top: 20px;
    color: #6b7280;
    font-size: 1rem;
    font-weight: 500;
}

@media (max-width: 768px) {
    .main-title {
        font-size: 1.5rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .charts-grid, .charts-grid2 {
        grid-template-columns: 1fr;
    }
    
    .stat-value, .stat-value-white {
        font-size: 2.5rem;
    }
}
</style>