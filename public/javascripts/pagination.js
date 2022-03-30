const paginate = document.getElementById("paginate");
const $campgroundsContainer = $("#campgrounds-container");
paginate.addEventListener("click", function (e) {
  e.preventDefault();
  fetch(this.href)
    .then(response => response.json())
    .then(data => {
      for (const campground of data.docs) { //for each campground object of the arrau
        let template = generateCampground(campground); //create a template by inserting the data from each individual campground
        $campgroundsContainer.append(template);
      }
      let { nextPage } = data;
      this.href = this.href.replace(/page=\d+/, `page=${nextPage}`); //updates the page query with the next page
      campgrounds.features.push(...data.docs); //updating clustermap with more locations, updating the feature array.
      map.getSource('campgrounds').setData(campgrounds); //getSource gets the source and then the setData updates the variable with new data.
    })
    .catch((err) => console.log("error here", err));
});

function generateCampground(campground) {
  let template = `<div class="card mb-3">
    <div class="row">
    <div class="col-md-4"> 
<img class="img-fluid" src="${
    campground.images.length
      ? campground.images[0].url
      : "https://res.cloudinary.com/du4fe9ocz/image/upload/v1648078452/YelpCamp/umlle7pv5yjpqeys5pzh.jpg"
  }"> 
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title"> ${campground.title} </h5>
        <p class="card-text"> ${campground.description} </p>
        <p class="card-text">
          <img class="img"src="/images/world.png" alt="">
          <small class="text-muted"> ${campground.location}</small>
        </p>
        <a class="btn btn-primary" href="/campgrounds/${campground._id}">View ${
    campground.title
  }</a>
      </div>
    </div>
  </div>
  </div>`;
  return template;
}
