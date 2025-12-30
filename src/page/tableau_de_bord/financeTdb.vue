<template>
    <div class="dashboard-container">
        <div class="max-w-7xl">
            <!-- En-tête -->
            <div class="header">
                <h1 class="main-title">PROMOTION {{ prom.name }}</h1>
                <div class="title-underline"></div>
            </div>

            <!-- Graphiques -->
            <div class="charts-grid2" v-if="chartsReady">
                <div class="chart-card">
                    <h3 class="chart-title">Frais fixes payés</h3>
                    <div class="chart-container">
                        <canvas ref="fraisFixesChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <h3 class="chart-title">Écolage par mois</h3>
                    <div class="chart-container">
                        <canvas ref="ecolageChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <h3 class="chart-title">Cantine par mois</h3>
                    <div class="chart-container">
                        <canvas ref="cantineChart"></canvas>
                    </div>
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
            paiements: [],

            // Frais fixes
            fraisFixesStats: [],

            // Écolage
            ecolageStats: {
                annee1: {},
                annee2: {}
            },

            // Cantine
            cantineStats: {
                annee1: {},
                annee2: {}
            },

            chartsReady: false,

            // Chart instances
            fraisFixesChart: null,
            ecolageChart: null,
            cantineChart: null,
        }
    },

    computed: {
        ...mapStores(selectPromStore)
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
                await this.loadFinanceData();
                
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                this.prom = { name: '' };
            } finally {
                this.isLoadingData = false;
            }
        },

        async loadFinanceData() {
            const { data, error } = await supabase
                .from('mjg_payment')
                .select('ele_id, categorie, annee, mois, montant')
                .neq('montant', null || 0)

            if (error) {
                console.error(error);
                return;
            }

            this.paiements = data;

            this.calculateFraisFixes();
            this.calculateEcolage();
            this.calculateCantine();

            await this.$nextTick();
            setTimeout(() => {
                    this.chartsReady = true;
                    this.$nextTick(() => {
                        this.createFraisFixesChart();
                        this.createEcolageChart();
                        this.createCantineChart();
                    });
                }, 100);
        },

        // Calcul des statistiques
        calculateFraisFixes() {
            const categories = [
                'droit_inscription',
                'carnet_1',
                'assurances_1',
                'ecole_parents',
                'uniforme_1',
                'uniforme_2',
                'uniforme_3',
                'carnet_2',
                'assurances_2'
            ];

            const map = {};
            categories.forEach(c => map[c] = new Set());

            this.paiements.forEach(p => {
                if (map[p.categorie]) {
                    map[p.categorie].add(p.ele_id);
                }
            });

            this.fraisFixesStats = categories.map(c => ({
                categorie: c,
                nombre: map[c].size
            }));
        },

        calculateEcolage() {
            const mois = [
                'janvier','février','mars','avril','mai','juin',
                'juillet','août','septembre','octobre','novembre','décembre'
            ];

            mois.forEach(m => {
                this.ecolageStats.annee1[m] = 0;
                this.ecolageStats.annee2[m] = 0;
            });

            this.paiements.forEach(p => {
                if (p.categorie === 'ecolage' && p.mois) {
                    if (p.annee === 1) this.ecolageStats.annee1[p.mois]++;
                    if (p.annee === 2) this.ecolageStats.annee2[p.mois]++;
                }
            });
        },

        calculateCantine() {
            const mois = [
                'janvier','février','mars','avril','mai','juin',
                'juillet','août','septembre','octobre','novembre','décembre'
            ];

            mois.forEach(m => {
                this.cantineStats.annee1[m] = 0;
                this.cantineStats.annee2[m] = 0;
            });

            this.paiements.forEach(p => {
                if (p.categorie === 'cantine' && p.mois) {
                    if (p.annee === 1) this.cantineStats.annee1[p.mois]++;
                    if (p.annee === 2) this.cantineStats.annee2[p.mois]++;
                }
            });
        },

        // chart
        createFraisFixesChart() {
            const ctx = this.$refs.fraisFixesChart.getContext('2d');

            this.fraisFixesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.fraisFixesStats.map(f => f.categorie),
                    datasets: [{
                        label: "Nombre d'élèves",
                        data: this.fraisFixesStats.map(f => f.nombre),
                        backgroundColor: '#3b82f6',
                        borderRadius: 8
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

        createEcolageChart() {
            const ctx = this.$refs.ecolageChart.getContext('2d');
            const mois = Object.keys(this.ecolageStats.annee1);

            this.ecolageChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: mois,
                    datasets: [
                        {
                            label: '1ère année',
                            data: mois.map(m => this.ecolageStats.annee1[m]),
                            backgroundColor: '#10b981'
                        },
                        {
                            label: '2ème année',
                            data: mois.map(m => this.ecolageStats.annee2[m]),
                            backgroundColor: '#6366f1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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

        createCantineChart() {
            const ctx = this.$refs.cantineChart.getContext('2d');
            const mois = Object.keys(this.cantineStats.annee1);

            this.cantineChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: mois,
                    datasets: [
                        {
                            label: '1ère année',
                            data: mois.map(m => this.cantineStats.annee1[m]),
                            backgroundColor: '#f59e0b'
                        },
                        {
                            label: '2ème année',
                            data: mois.map(m => this.cantineStats.annee2[m]),
                            backgroundColor: '#ef4444'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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

        destroyCharts() {
            const charts = [
                'fraisFixesChart',
                'ecolageChart',
                'cantineChart'
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