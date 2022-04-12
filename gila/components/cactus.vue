<template>
  <div class="w-full">

    <Dialog :modal="true" v-model:visible="writingTweet" >
      <template #header>
        <h3>Write a Tweet:</h3>
      </template>

      <Textarea v-if="!sendingTweet" v-model.trim="tweetText" :autoResize="true" rows="5" cols="30" />
      <i v-if="sendingTweet" class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" :disabled="sendingTweet" @click="writingTweet = false" />
        <Button label="Send It!" icon="pi pi-check" autofocus :disabled="!tweetText || sendingTweet" @click="sendTweet" />
      </template>
    </Dialog>

    <div class="w-3/4 mx-auto mt-16 flex justify-between">
      <div>
        <h5>Find Accounts to follow</h5>
        <AutoComplete
          v-model="searchVal"
          :suggestions="$store.searchedAccounts"
          field="user_address"
          @complete="searchAccounts($event)"
          :delay="722"
          @item-select="followAccount($event)"
        />
      </div>
      
      <Button label="Tweet" icon="pi pi-plus" class="p-button-rounded" @click="writingTweet = true" />
    </div>
    <Card v-for="tweet in $store.myTweets" class="w-3/4 mx-auto my-16">
      <template #title>
        <i class="pi pi-user mr-2" style="font-size: 2rem"></i> {{ tweet.username }}
        <span style="font-size: 0.7rem; font-weight: 200; " class="float-right">{{ tweet.created_at }}</span>
      </template>
      <template #content>
        <p>
          {{ tweet.tweet }}
        </p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">

import { mapStores } from 'pinia';
import { store } from '../store/index';

export default {
  data() {
    return {
      writingTweet: false,
      sendingTweet: false,
      searching: null,
      searchVal: null,
      tweetText: ''
    };
  },
  computed: {
    ...mapStores(store)
  },
  methods: {
    sendTweet: async function () {
      if (!this.tweetText) return;

      try {
        this.sendingTweet = true
        await this.$store.tweet({
          tweet: this.tweetText
          // reploy to etc...
        });
      } catch (err) {
        this.$store.alert(err.message);
        this.sendingTweet = false;
      }
    },
    searchAccounts: async function (eve) {
      const addr = eve.query

      await this.$store.findFollowers(addr);
    },
    followAccount: async function (eve) {
      const account = eve.value;

      this.searchVal = null;

      await this.$store.followAccount(account);
      this.$store.alert({severity: 'success', content: `You are following ${account.user_address}!`});
    }
  }
};

</script>
