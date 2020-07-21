// @flow
import * as ICONS from 'constants/icons';
import React, { useRef } from 'react';
import Page from 'component/page';
import ClaimListDiscover from 'component/claimListDiscover';
import Button from 'component/button';
import useHover from 'effects/use-hover';
import useIsMobile from 'effects/use-is-mobile';
import analytics from 'analytics';
import HiddenNsfw from 'component/common/hidden-nsfw';
import Icon from 'component/common/icon';
import * as CS from 'constants/claim_search';
import Ads from 'web/component/ads';

const RABBIT_HOLE_CHANNELS = [
  'a5af5f42b57d31b982fd700f65b02ee589751b96',
  'ea86138fdfac9891a2e15cec9b2143ef64805435',
  'b541d03b30c3fea017280d8ae1758a9f2035f44f',
  '81c637fdba001ff4406123c1fd4f5a1c6e1772f7',
  '0c4a8b59b2e1bf396210be96f690d8d37251d39b',
  'a190ec65b6d67df868be2208c62510c257ace16e',
  'df75764e06247ccec50dbc87a9c4a8a95a32658d',
  'd70c3d47eff085d56e6328fc2f2def163b1d21fb',
  'ddc7f2030c474ca4c9c0043bf19ec0bf79e2783f',
  '02f3c6b00fcaa365c5858352ca1ee149aea7b90f',
  '6259aac793195c93a4dce1940e2581c238fd2021',
  '526b15b49e5ff7d1fd9443b7f9b30ad1194c3235',
  '70d122698cc6d3511036c7fb2e6dca5c358463de',
  'f14e64d962c226630702f9a61f48ab4f55ecffb9',
  'bc490776f367b8afccf0ea7349d657431ba1ded6',
  '935e7ed2c8b2a184ba2f39167f0201a74910235b',
  '64adb5d029acaff293b2934e870d3976760a1353',
  '3fec094c5937e9eb4e8f5e71e4ca430e8a993d03',
  '780abbacb30bffd0554a3d6e79764cdc3551a0a5',
  'e8db076af81d517098c81b30c71ce42cf05daeda',
  '4407261b86abf43b85448657d9d2a4f13a968d87',
  '191a3374da974a9528cd39497ffb31011988dfce',
  '40592b2f8bba7f702c62b8ab91402bd1a257ab18',
  '0e42d95f05f3543937390f1a573d6fd9840eaa46',
  '7a3c90e0e7d7214f6bbe2994a4a5fff6d4afd515',
  '8dc55cd4acb6e8d903a85e3bd9b15478bbdad3b5',
  'a8d874a26b64b7cf2584268ffcfe4c5e07aac6d4',
  'f6190681f20cbb905f5ff7d58e568603f81de8ba',
];

type Props = {
  location: { search: string },
  followedTags: Array<Tag>,
  repostedUri: string,
  repostedClaim: ?GenericClaim,
  doToggleTagFollowDesktop: string => void,
  doResolveUri: string => void,
  isAuthenticated: boolean,
  rabbitHole: boolean,
};

function DiscoverPage(props: Props) {
  const {
    location: { search },
    followedTags,
    repostedClaim,
    repostedUri,
    doToggleTagFollowDesktop,
    doResolveUri,
    isAuthenticated,
    rabbitHole,
  } = props;
  const buttonRef = useRef();
  const isHovering = useHover(buttonRef);
  const isMobile = useIsMobile();

  const urlParams = new URLSearchParams(search);
  const claimType = urlParams.get('claim_type');
  const tagsQuery = urlParams.get('t') || null;
  const tags = tagsQuery ? tagsQuery.split(',') : null;
  const repostedClaimIsResolved = repostedUri && repostedClaim;
  const claimSearchProps = rabbitHole
    ? {
        channelIds: RABBIT_HOLE_CHANNELS,
        claimType: [CS.CLAIM_STREAM],
      }
    : {};

  // Eventually allow more than one tag on this page
  // Restricting to one to make follow/unfollow simpler
  const tag = (tags && tags[0]) || null;

  const isFollowing = followedTags.map(({ name }) => name).includes(tag);
  let label = isFollowing ? __('Following') : __('Follow');
  if (isHovering && isFollowing) {
    label = __('Unfollow');
  }

  React.useEffect(() => {
    if (repostedUri && !repostedClaimIsResolved) {
      doResolveUri(repostedUri);
    }
  }, [repostedUri, repostedClaimIsResolved, doResolveUri]);

  function handleFollowClick() {
    if (tag) {
      doToggleTagFollowDesktop(tag);

      const nowFollowing = !isFollowing;
      analytics.tagFollowEvent(tag, nowFollowing, 'tag-page');
    }
  }

  let headerLabel;
  if (repostedClaim) {
    headerLabel = __('Reposts of %uri%', { uri: repostedUri });
  } else if (tag) {
    headerLabel = (
      <span>
        <Icon icon={ICONS.TAG} size={10} />
        {(tag === CS.TAGS_ALL && __('All Content')) || (tag === CS.TAGS_FOLLOWED && __('Followed Tags')) || tag}
      </span>
    );
  } else {
    headerLabel = (
      <span>
        <Icon icon={ICONS.DISCOVER} size={10} />
        {__('All Content')}
      </span>
    );
  }

  return (
    <Page noFooter>
      <ClaimListDiscover
        claimType={claimType ? [claimType] : undefined}
        headerLabel={headerLabel}
        tags={tags}
        hiddenNsfwMessage={<HiddenNsfw type="page" />}
        repostedClaimId={repostedClaim ? repostedClaim.claim_id : null}
        injectedItem={!isAuthenticated && IS_WEB && <Ads type="video" />}
        {...claimSearchProps}
        meta={
          tag &&
          !isMobile && (
            <Button
              ref={buttonRef}
              button="alt"
              icon={ICONS.SUBSCRIBE}
              iconColor="red"
              onClick={handleFollowClick}
              requiresAuth={IS_WEB}
              label={label}
            />
          )
        }
      />
    </Page>
  );
}

export default DiscoverPage;
