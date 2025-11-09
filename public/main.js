var edit = document.getElementsByClassName("fa-pen");
var trash = document.getElementsByClassName("fa-trash");

Array.from(edit).forEach(function(element) {
      element.addEventListener('click', function(){
        const task = this.closest('li').innerText.trim()
        document.querySelector('input').value = task
        // fetch('messages', {
        //   method: 'put',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     'task': task
        //   })
        // }).then(function (response) {
        //   window.location.reload()
        // })
      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const task = this.closest('li').innerText.trim()
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'task': task
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
