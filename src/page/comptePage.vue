    <template>
        <!-- Si super administrateur -->
        <div v-if="userStore.role_id === 1">
            <div class="col-xs-3 rech">
                <br>
            </div>
            <LoadingComponent v-if="isloading" dataload="des utilisateurs"/>
            <TableComponent
                v-if="!isloading"
                :rows="utilisateurs"
                :columns="colonnes"
                >
                <template #actions = "{item}">
                    <TableAction :id="item.id" title="un utilisateur" :view_but_del="false" :modalcompte='true'/>
                </template>
            </TableComponent>
        </div>
        <!-- Si simple utilisateur ou administrateur -->
        <div v-if="userStore.role_id != 1">
            <div class="card">
                <h1>Bienvenue {{ userStore.name_user }}</h1>
                <div class="row">
                    <div class="col-6">
                    <div class="card-body">
                        <h3><strong>Vos informations personnelles</strong></h3>
                        <div class="row">
                            <div class="col-9">
                                <p><strong>Nom :</strong> {{ userStore.name_user }}</p>
                                <p><strong>Email :</strong> {{ userStore.email }}</p>
                                <p><strong>Rôle :</strong> {{ userStore.role || 'Utilisateur' }}</p>
                            </div>
                            <div class="col-3">
                                <div  
                                    class="box_icon icon-modifier" 
                                    data-toggle="modal" 
                                    :data-target="'#updateName'+userStore.id"
                                    >
                                </div>
                                <div 
                                    class="box_icon icon-modifier"
                                    data-toggle="modal" 
                                    :data-target="'#updateEmail'+userStore.id">
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    </div>
                    <div class="col-6">
                        <div class="card-body">
                            <h3><strong>Vos privileges et droits</strong></h3>
                            <label><strong>DOMAINE</strong></label>
                            <div class="row">
                            <div v-for="domaine in domain_data" :key="domaine.id" class="col col-sm-4" style="text-align: center;">
                                <label>{{ domaine.label }}:</label><br>
                                <input type="checkbox" v-model="userStore[domaine.key]" disabled>
                            </div>
                            </div>
                            <label><strong>PRIVILEGE</strong></label>
                            <div class="row">
                            <div v-for="privileges in privileges_data" :key="privileges.id" class="col col-sm-4" style="text-align: center;">
                                <label>{{ privileges.label }}:</label><br>
                                <input type="checkbox" v-model="userStore[privileges.key]" disabled>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->

            <!-- updateName -->
            <ModalComponent :id="'updateName'+userStore.id" title="Modifier votre nom d'utilisateur" >
                <FormComponent :inputs="inputs" label_button="Modifier" @submit="updateUser"/>
            </ModalComponent>

            <!-- updateEmail -->
            <ModalComponent :id="'updateEmail'+userStore.id" title="Modifier votre email" >
                <FormComponent :inputs="inputs_email" label_button="Modifier" @submit="updateEmail"/>
            </ModalComponent>
            
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





export default {
    name: 'GestionUtilisateurs',
    components: { 
        TableComponent,
        LoadingComponent,
        TableAction,
        ModalComponent,
        FormComponent

    },
    data() {
    return {
        isloading: true,
        utilisateurs: [
        // { id: 1, name: 'Jean Dupont', mdp: 'azerty123' },
        // { id: 2, name: 'Marie Claire', mdp: 'motdepasse' }
        ],
        colonnes: [
        { key: 'email', label: 'Email' },
        { key: 'name_user', label: 'Pseudo' },
        { key: 'ctg_name', label: 'Role de l\'utilisateur' },
        { key: 'activer', label: 'Statut du compte' }
        ],

        domain_data:[
            { key: 'fin', label: 'Finance' },
            { key: 'ele', label: 'Eleve' },
            { key: 'can', label: 'Candidat' },
        ],
        privileges_data:[
            { key: 'add', label: 'Ajouter' },
            { key: 'edit', label: 'Modifier' },
            { key: 'delet', label: 'Supprimer' },
        ],
        subscribeData: [],
    }
    },
    watch: {
        subscribeData: {
            handler() {
            this.list_user();
            },
            deep: true 
        }
    },
    computed: {
        ...mapStores(useUserStore,useSubscribeStore),
        inputs() {
            return [
                { 
                    id: 'name_user', 
                    label: 'Nom d\'utilisateur', 
                    type: 'text',
                    placeholder: 'Nom d\'utilisateur',
                    required: true,
                    initialValue: this.userStore.name_user,
                },
            ]
        },
        inputs_email() {
            return [
                { 
                    id: 'email', 
                    label: 'Email', 
                    type: 'email',
                    placeholder: 'Email',
                    required: true,
                    initialValue: this.userStore.email,
                },
            ]
        },
    },
    methods: {
        async list_user(){
            const { data, error } = await supabase
                .from('users')
                .select('* , list_ctg (name_ctg) as name_ctg')
                .order('activer', { ascending: false });
            if (error) {
                console.error('Erreur chargement utilisateurs :', error.message)
            } else {
                /*
                u => (...)
                    → Ça veut dire : "Pour chaque u (un utilisateur), je retourne un nouvel objet qui contient :"
                    { ...u, ... }
                    → Je commence par copier toutes les propriétés de u (id, email, list_ctg, etc.).
                    C’est ce que ...u fait.
                    Exemple :
                    Si u = { id: 1, name: 'Alice' } → ...u donne { id: 1, name: 'Alice' }.

                    ctg_name: ...
                    → Puis j’ajoute une nouvelle propriété ctg_name.
                */
                this.utilisateurs = data.map(u => ({
                        ...u,
                        ctg_name: u.list_ctg?.name_ctg || 'Non défini',
                        activer: u.activer ? 'Activé' : 'Désactivé'
                        }));
                this.isloading = false
            }
            
        },
        async updateUser(formData) {
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ name_user: formData.name_user })
                    .eq('id', this.userStore.id);
                if (error) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error.message);
                return;
                }
                // Mettre à jour userStore de manière réactive
                this.userStore.update_name(formData.name_user);

                alert('Votre nom a bien été modifié !');
            } catch (err) {
                console.error('Erreur inattendue :', err);
            }
        },  
        async updateEmail(formData) {
            try {
                const { error } = supabase.auth.updateUser({ email: formData.email });
                if (error) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error.message);
                return;
                }
                // Mettre à jour userStore de manera réactive
                this.userStore.update_email(formData.email);

                alert("Un email de confirmation a été envoyé à votre adresse actuelle. Veuillez cliquer sur le lien dans cet email pour finaliser la modification.");

                this.$router.push('/')
            } catch (err) {
                console.error('Erreur inattendue :', err);
            }
        },

        subscribeToTable() {
            this.realtimeStore.subscribeToTable('users', 'subscribeData', this);
            this.subscribeData = this.utilisateurs
        },
    },
    async mounted() {
    if (this.userStore.role_id === 1) {
        await this.list_user();
        this.subscribeToTable();
    }
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('users', 'subscribeData');
    },
}
</script>

<style scoped>
.card {
    padding: 70px;
    border-radius: 15px;
}
.box_icon{
    width: 35px;
    height: 35px;
    border-radius: 0px;
    background-size: 70%;
    background-position: center;
    background-repeat: no-repeat;
    cursor: pointer;
}
</style>