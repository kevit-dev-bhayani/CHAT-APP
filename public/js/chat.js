// const logger=require('../logger')
const socket=io()

//Elements
const $messageForm=document.getElementById('message-form');
const $messageFormInput=$messageForm.querySelector("#input")
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocation=document.getElementById('send-location');
const $messages=document.getElementById('message')
// const send=document.getElementById('send');

//Templates
const messageTemplate=document.getElementById('message-template').innerHTML
const locationMessageTemplate=document.getElementById('location-message-template').innerHTML
const sidebarTemplate=document.getElementById('sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message',(message)=>{
    // console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    // console.log(url)
    const html=Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value

    socket.emit("sendMessage",message,(error)=>
    {
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value=''
        
        if(error){
            return (error)
        }
        // console.log("message delivered successfully")
    })
})

$sendLocation.addEventListener('click',()=>{
    $sendLocation.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit("sendLocation",{latitude:position.coords.latitude,longitude:position.coords.longitude},()=>{
            $sendLocation.removeAttribute("disabled")
            // console.log("location shared")
        })
    })
})
// sidebar-template
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
        
    }
    // console.log(`user added to : ${room}`)
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    const sidebar=document.getElementById('sidebar')
    sidebar.innerHTML=html

})