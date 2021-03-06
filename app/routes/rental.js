import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('rental', params.rental_id);
  },
  actions: {
    update(rental, params) {
      Object.keys(params).forEach(function(key) {
        if(params[key]!==undefined) {
          rental.set(key,params[key]);
        }
      });
      rental.save();
      this.transitionTo('index');
    },
    destroyRental(rental) {// this guarantees the reviews are deleted with the rentals
      var review_deletions = rental.get('reviews').map(function(review) { //iterates over all the rental's reviews
        return review.destroyRecord(); //destroys them one by one
      });
      Ember.RSVP.all(review_deletions).then(function() { //waits until all reviews are destroyed
        return rental.destroyRecord(); //then destroys the rental
      });
      this.transitionTo('index');
    },
    saveReview(params) {
      var newReview = this.store.createRecord('review', params); // Create a new review with the information from our parameters, save it to the database, and call it "newReview".
      var rental = params.rental;// Refer to the rental in those parameters as "rental".
      rental.get('reviews').addObject(newReview); // Retrieve the list of reviews located in "rental", and add "newReview" to that list.
      newReview.save().then(function() { // Save "newReview", so it remembers what rental it belongs in.
        return rental.save(); // Wait until "newReview" has finished saving, then save "rental" too, so it remembers it contains "newReview".
      });
      this.transitionTo('rental', rental); // Afterwards, take us to the page displaying details for "rental".
    },
    destroyReview(review) {
      review.destroyRecord();
      this.transitionTo('index');
    }
  }
});

// Line by Line clarification of saveReview
