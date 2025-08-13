<template>
    <div class="modal fade" :id="'mod'+id" tabindex="-1" role="dialog" aria-labelledby="updateUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal_container_pop" role="document">
        <div class="modal-content">
        <div class="common_container modal_container">
            <section class="common_section">
            <form class="form" role="form" @submit.prevent="handleSubmit">
                <div class="text-center">
                <h3 class="section_name">Modifier un utilisateur </h3>
                </div>
                <hr>
                <div class="modal-body">
                <div class="form-group text-center">
                    <label for="email">EMAIL</label>
                    <input type="email" class="form-control" id="email" v-model="form.email" placeholder="Entrez un email" disabled>

                    <label for="nom">PSEUDO DE L'UTILISATEUR</label>
                    <input type="text" class="form-control" id="nom" v-model="form.name_user" placeholder="Entrez votre pseudo" disabled>

                    <label for="ctg">CATEGORIE</label>
                    <select class="form-control" v-model="form.id_ctg">
                    <option value="2">Administrateur</option>
                    <option value="3">Visiteur</option>
                    </select>

                    <label for="ctg">STATUT DU COMPTE</label>
                    <select class="form-control" v-model="form.activer">
                    <option value="true">Activé</option>
                    <option value="false">Désactivé</option>
                    </select>

                    <label>DOMAINE</label>
                    <div class="row">
                    <div class="col col-sm-4">
                        <label>Finance:</label><br>
                        <input type="checkbox" v-model="form.fin">
                    </div>
                    <div class="col col-sm-4">
                        <label>Eleve:</label><br>
                        <input type="checkbox" v-model="form.ele">
                    </div>
                    <div class="col col-sm-4">
                        <label>Candidat:</label><br>
                        <input type="checkbox" v-model="form.can">
                    </div>
                    </div>

                    <label>PRIVILEGE</label>
                    <div class="row">
                    <div class="col col-sm-4">
                        <label>Ajouter:</label><br>
                        <input type="checkbox" v-model="form.add">
                    </div>
                    <div class="col col-sm-4">
                        <label>Modifier:</label><br>
                        <input type="checkbox" v-model="form.edit">
                    </div>
                    <div class="col col-sm-4">
                        <label>Supprimer:</label><br>
                        <input type="checkbox" v-model="form.delet">
                    </div>
                    </div>
                </div>
                </div>
                <div class="modal-footer">
                <button class="btn btn-primary" type="submit" :disabled="loading">Modifier</button>
                <button class="btn btn-light" data-dismiss="modal">Fermer</button>
                </div>
            </form>
            </section>
        </div>
        </div>
    </div>
    </div>
</template>

<script>
import { supabase } from '@/supabase';

export default {
    props: {
        id: String
    },
    data() {
        return {
            form: {
                email: null,
                name_user: null,
                id_ctg: null,
                fin: null,
                ele: null,
                can: null,
                add: null,
                edit: null,
                delet: null
            },
            loading: false
        }
    },
    methods: {
        async recover_data(){
            const {data} = await supabase
            .from('users')
            .select('*')
            .eq('id', this.id)
            this.form = data[0]
        },

        async handleSubmit() {
            this.loading = true
            try {
            // Modifier l'utilisateur correspondant dans public.users
            const { error: updateError } = await supabase
                .from('users')
                .update({
                fin: this.form.fin,
                ele: this.form.ele,
                can: this.form.can,
                add: this.form.add,
                edit: this.form.edit,
                delet: this.form.delet,
                activer: this.form.activer
                })
                .eq('id', this.id)
                if (updateError) throw updateError  
                alert('Modification effectuée avec succès!') 
        }catch (error) {
            alert('Erreur lors de la modification du pseudo!')
        } finally {
            this.loading = false
        }
        }
    },
    mounted() {
        this.recover_data()
    }
}
</script>