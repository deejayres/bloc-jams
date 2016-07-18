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
            updateSeekBarWhileSongPlays();
			$(this).html(pauseButtonTemplate);			
			updatePlayerBarSong();
            
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
            
		} else if (currentlyPlayingSongNumber === songNumber) {
			if (currentSoundFile.isPaused()) {
				$(this).html(pauseButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPauseButton);
				currentSoundFile.play();
                updateSeekBarWhileSongPlays();
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

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ( $(this).parent().attr('class') == 'seek-control' ) {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    
    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ( $seekBar.parent().attr('class') == 'seek-control' ) {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio * 100);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
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
    updateSeekBarWhileSongPlays();
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
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
  
	//move pause button in list appropriately
	var nowPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    nowPlayingCell.html(pauseButtonTemplate);
	var newPreviousCell = getSongNumberCell(nowPreviousSongNumber);
    newPreviousCell.html(nowPreviousSongNumber);
};

var togglePlayFromPlayerBar = function() {
	var nowPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
	
	if (currentSoundFile.isPaused()) {
		nowPlayingCell.html(pauseButtonTemplate);
		$(this).html(playerBarPauseButton);
		currentSoundFile.play();
	} else {
		nowPlayingCell.html(playButtonTemplate);
		$(this).html(playerBarPlayButton);
		currentSoundFile.pause();
	}
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

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
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
var $play_pauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
	setCurrentAlbum(albumPicasso);
    setupSeekBars();
	$previousButton.click(previousSong);
	$nextButton.click(nextSong);
	$play_pauseButton.click(togglePlayFromPlayerBar);
});


