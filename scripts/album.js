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
        var songNumber = parseInt($(this).attr('data-song-number'));
        
		if (currentlyPlayingSongNumber !== null) {
			var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
			currentlyPlayingCell.html(currentlyPlayingSongNumber);
		}
		
		if (currentlyPlayingSongNumber !== songNumber) {
			setSong(songNumber);
			currentSoundFile.play();
			$(this).html(pauseButtonTemplate);			
			updatePlayerBarSong();
		} else if (currentlyPlayingSongNumber === songNumber) {
//			$(this).html(playButtonTemplate);
//			$('.main-controls .play-pause').html(playerBarPlayButton);
//			setSong(null);
			if (currentSoundFile.isPaused()) {
				$(this).html(pauseButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPauseButton);
				currentSoundFile.play();
			} else {
				$(this).html(playButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPlayButton);
				currentSoundFile.pause();
			}
		}
    };
    
    var onHover = function(event) {
		var songNumber = parseInt($(this).find('.song-item-number').attr('data-song-number'));
        if (songNumber !== currentlyPlayingSongNumber) {
            $(this).find('.song-item-number').html(playButtonTemplate);
        }
    };
    
    var offHover = function(event) {
        var songNumber = parseInt($(this).find('.song-item-number').attr('data-song-number'));
        if (songNumber !== currentlyPlayingSongNumber) {
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
    
    //wrap around to first song from last song
    if (nowPreviousIndex === currentAlbum.songs.length - 1 ) {
        setSong(1);
    } else {
        var nowPlayingNumber = nowPreviousSongNumber + 1;
        setSong(nowPlayingNumber);
    };
    
	currentSoundFile.play();
    updatePlayerBarSong();
  
	//move pause button in list appropriately
	var nowPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    nowPlayingCell.html(pauseButtonTemplate);
	var newPreviousCell = getSongNumberCell(nowPreviousSongNumber);
    newPreviousCell.html(nowPreviousSongNumber);
};

var previousSong = function() {
    //tracking the song we are switching away from
    var nowPreviousIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var nowPreviousSongNumber = nowPreviousIndex + 1;
    
    //wrap around to last song from first song
    if (nowPreviousIndex === 0 ) {
        setSong(currentAlbum.songs.length);
    } else {
        var nowPlayingNumber = nowPreviousSongNumber - 1;
        setSong(nowPlayingNumber);
    };
    
	currentSoundFile.play();
    updatePlayerBarSong();
  
	//move pause button in list appropriately
	var nowPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    nowPlayingCell.html(pauseButtonTemplate);
	var newPreviousCell = getSongNumberCell(nowPreviousSongNumber);
    newPreviousCell.html(nowPreviousSongNumber);
};

var setSong = function(songNumber) {
	if (currentSoundFile) {
		currentSoundFile.stop();
	}
	
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
	currentSoundFile = new buzz.sound(currentSongFromAlbum.audioURL, {
		formats: [ 'mp3' ],
		preload: true
	});
	
	setVolume(currentVolume);
};

var setVolume = function(volume) {
	if (currentSoundFile) {
		currentSoundFile.setVolume(volume);
	}
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="'+ number +'"]');
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"</span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
	setCurrentAlbum(albumPicasso);
	$previousButton.click(previousSong);
	$nextButton.click(nextSong);
});


