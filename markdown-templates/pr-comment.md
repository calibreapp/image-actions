Images automagically compressed by [Calibre](https://calibreapp.com)'s [image-actions](https://github.com/marketplace/actions/image-actions) ✨

Compression reduced images by <strong><%- overallPercentageSaved %>%</strong>, saving <strong><%- overallBytesSaved %></strong>.

| Filename | Before | After | Improvement |
| -------- | ------ | ----- | ----------- |
<% optimisedImages.forEach((image) => { -%>
| <code><%- image.name %></code> | <%- image.formattedBeforeStats %> | <%- image.formattedAfterStats %> | <%- image.formattedPercentChange %> |
<% }); %>

<% if(unoptimisedImages.length) { -%>
<%- unoptimisedImages.length %> <%- unoptimisedImages.length > 1 ? 'images' : 'image' %> did not require optimisation.
<% } %>

**Update required:** Update image-actions configuration to the latest version **before 1/1/21.** See [README for instructions.](https://github.com/calibreapp/image-actions)
