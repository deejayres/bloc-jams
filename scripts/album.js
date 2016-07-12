var createSongRow = function(songNumber, songName, songLength) {
    var template =
		'<tr class="album-view-song-item">'
	+	'	<td class="song-item-number" data-song-number="' + songNumber +'">' + songNumber + '</td>'
	+	'	<td class="song-item-title">' + songName + '</td>'
	+	'	<td class="song-item-duration">' + songLength + '</td>'
	+	'</tr>'
	;
	
	var $row = $(template);
    
    var clickHandler = function() {
        var songNumber = $(this).attr('data-song-number');
        
        if(currentlyPlayingSongNumber === null) {
            $(this).html(pauseButtonTemplate);
            currentlyPlayingSongNumber = songNumber;
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
            currentlyPlayingSongNumber = null;
            currentSongFromAlbum = null;
        } else if (currentlyPlayingSongNumber !== songNumber) {
            var nowPlaying = $('.song-item-number[data-song-number="'+ currentlyPlayingSongNumber +'"]');
            nowPlaying.html(currentlyPlayingSongNumber);
            $(this).html(pauseButtonTemplate);
            currentlyPlayingSongNumber = songNumber;
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updatePlayerBarSong();
        }
    };
    var onHover = function(event) {
        if ($(this).find('.song-item-number').attr('data-song-number') !== currentlyPlayingSongNumber) {
            $(this).find('.song-item-number').html(playButtonTemplate);
        }
    };
    var offHover = function(event) {
        var songNumber = $(this).find('.song-item-number').attr('data-song-number');
        if ($(this).find('.song-item-number').attr('data-song-number') !== currentlyPlayingSongNumber) {
            $(this).find('.song-item-number').html(songNumber);
        }        
    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
	var $albumTitle = $('.album-view-title');
	var $albumArtist = $('.album-view-artist');
	var $albumReleaseInfo = $('.album-view-release-info');
	var $albumImage = $('.album-cover-art');
	var $albumSongList = $('.album-view-song-list');
	
	$albumTitle.text(album.title);
	$albumArtist.text(album.artist);
	$albumReleaseInfo.text(album.year + ' ' + album.label);
	$albumImage.attr('src', album.albumArtUrl);
	
	$albumSongList.empty();
	
	for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
	}
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);  
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-song-mobile').text(currentAlbum.artist + ' - ' + currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var nextSong = function() {
    //tracking the song we are switching away from
    var nowPreviousIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var nowPreviousSongNumber = nowPreviousIndex + 1;
    var nowPlayingSongNumber = null;
    
    //wrap around to first song from last song
    if (nowPreviousIndex === currentAlbum.songs.length - 1 ) {
        currentSongFromAlbum = currentAlbum.songs[0];
        nowPlayingSongNumber = 0;
    } else {
        currentSongFromAlbum = currentAlbum.songs[nowPreviousIndex + 1];
        nowPlayingSongNumber = trackIndex(currentAlbum, currentSongFromAlbum);
    };
    
    updatePlayerBarSong();
//TODO    
//    $('.song-item-number[data-song-number="'+ nowPlayingSongNumber +'"]').html(pauseButtonTemplate);
//    $('.song-item-number[data-song-number="'+ nowPreviousSongNumber +'"]').html(nowPreviousSongNumber);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"</span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

$(document).ready(function() {
	setCurrentAlbum(albumPicasso);
});


